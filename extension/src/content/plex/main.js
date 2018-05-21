import Pusher from "pusher-js";
import apolloClient from "../../shared/apollo";
import config from "../../shared/config";
import pause from "../../shared/graphql/mutations/pause.graphql";
import play from "../../shared/graphql/mutations/play.graphql";
import Plex from "./plex";

Pusher.logToConsole = config.debug;
console.debug(config.debug);

const EVENT_PLAY = "play";
const EVENT_PAUSE = "pause";
const EVENT_SCRUB = "scrub";

class Player {
    constructor() {
        this.plex = new Plex((newNotification, oldNotification) =>
            this.onStateChange(newNotification, oldNotification)
        );

        const onChangedEvents = {
            me: (newValue, oldValue) => this.onMeChanged(newValue, oldValue),
            group: (newValue, oldValue) =>
                this.onGroupChanged(newValue, oldValue),
        };
        browser.storage.local.get().then(data => {
            const storedData = ["group", "me"];

            for (const name of storedData) {
                if (data[name]) {
                    this[name] = data[name];
                    if (onChangedEvents[name]) {
                        onChangedEvents[name](data[name], null);
                    }
                }
            }
        });

        browser.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === "local") {
                for (var key in changes) {
                    const change = changes[key];
                    this[key] = change.newValue;
                    if (onChangedEvents[key]) {
                        onChangedEvents[key](change.newValue, change.oldValue);
                    }
                }
            }
        });
    }

    /**
     * onStateChange is called when the state changes from playing or paused,
     * or when the viewOffset changes.
     * @param {PlaySessionStateNotification} newNotification New PlaySessionStateNotification received from the websocket.
     * @param {PlaySessionStateNotification} oldNotification Previous PlaySessionStateNotification received from the websocket.
     */
    onStateChange(newNotification, oldNotification) {
        const initial = oldNotification === undefined;
        const newState = newNotification.state;
        const isScrubbing =
            !initial && oldNotification.state !== newNotification.state;

        if (initial) {
            return;
        }
        // viewOffset is in milliseconds.
        const seconds = newNotification.viewOffset / 1000;

        if (newState === Plex.PLAYING) {
            this.onLocalPlay(seconds);
        } else if ([Plex.PAUSED, Plex.STOPPED].includes(newState)) {
            this.onLocalPause(seconds);
        } else {
            console.warn(`Unsupported state change found: "${newState}".`);
            console.warn(newNotification);
        }
    }

    onMeChanged(newValue, oldValue) {}

    onGroupChanged(newGroup, oldGroup) {
        if (oldGroup) {
            console.debug("Unsubscribing from old Pusher channel.");
            this.socket.unsubscribe(oldGroup.id);
        }

        if (newGroup) {
            this.plex.startListening();
            this.updateChannel(newGroup);
        } else {
            this.plex.stopListening();
        }
    }

    updateChannel(group) {
        if (!this.socket) {
            console.debug("this.socket was undefined.");
            console.debug(config.pusher);
            this.socket = new Pusher(
                config.pusher.apiKey,
                config.pusher.options
            );
        }
        console.debug(`Subscribing to Pusher channel "${group.id}"...`);

        this.channel = this.socket.subscribe(group.id);
        this.channel.bind(EVENT_PLAY, event => this.onChannelPlay(event));
        this.channel.bind(EVENT_PAUSE, event => this.onChannelPause(event));
        this.channel.bind(EVENT_SCRUB, event => this.onChannelScrub(event));
    }

    /**
     * Return the amount of seconds left.
     *
     * It does this by getting the remaining time in the format (HH:)MM:SS,
     * splitting it up and reversing it. Each part is then multiplied by
     * 60 to the power of its index. This way an hour is multiplied by 3600
     * or 60^2 and minutes by 60.
     */
    // getSeconds() {
    //     const time = document.querySelector(`.${REMAINING_TIME_CLASS}`)
    //         .textContent;
    //     const timeParts = time.split(":");
    //     let seconds = 0;
    //     timeParts.reverse().forEach((element, index) => {
    //         seconds += parseInt(element) * Math.pow(60, index);
    //     });
    //     return seconds;
    // }

    sendEvent(mutation, seconds) {
        apolloClient
            .mutate({
                mutation: mutation,
                variables: {
                    seconds: parseInt(seconds),
                },
            })
            .then(result => {
                console.log(result);
            })
            .catch(error => {
                console.error(error);
            });
    }

    onLocalPlay(seconds) {
        console.debug("Started playing locally...");
        this.sendEvent(play, seconds);
    }

    onChannelPlay(event) {
        console.debug("Started playing remotely...");
        console.debug(event);
        this.plex.play();
    }

    onLocalPause(seconds) {
        console.debug("Paused locally...");
        this.sendEvent(pause, seconds);
    }

    onChannelPause(event) {
        console.debug("Paused remotely...");
        console.debug(event);
        this.plex.pause();
    }

    onLocalScrub(seconds) {}

    onChannelScrub(event) {
        this.plex.seekTo(event.seconds * 1000);
    }
}

new Player();
