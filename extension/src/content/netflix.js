import Pusher from "pusher-js";
import apolloClient from "../shared/apollo";
import config from "../shared/config";
import play from "../shared/graphql/mutations/play.graphql";

const socket = new Pusher(config.pusher.apiKey, config.pusher.options);

Pusher.logToConsole = config.debug;

const PLAY_CLASS = "button-nfplayerPlay";
const PAUSE_CLASS = "button-nfplayerPause";
const REMAINING_TIME_CLASS = "time-remaining__time";

const EVNET_PLAY = "play";
const EVENT_PAUSE = "pause";
const EVENT_SCRUB = "scrub";

class Player {
    constructor() {
        document.addEventListener("click", event => {
            if (event.target.classList.contains(PLAY_CLASS)) {
                this.onPlay();
            }
            if (event.target.classList.contains(PAUSE_CLASS)) {
                this.onPause();
            }
        });

        const onChangedEvents = {
            me: this.onMeChanged,
            group: this.onGroupChanged,
        };

        browser.storage.onChanged.addListener((changed, areaName) => {
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

    onMeChanged(newValue, oldValue) {}

    onGroupChanged(newGroup, oldGroup) {
        if (oldGroup) {
            socket.unsubscribe(oldGroup.id);
        }

        if (newGroup) {
            this.updateChannel();
        }
    }

    updateChannel() {
        this.channel = socket.subscribe(newGroup.id);
        this.channel.bind(EVENT_PLAY, this.onChannelPlay);
        this.channel.bind(EVENT_PAUSE, this.onChannelPause);
        this.channel.bind(EVENT_SCRUB, this.onChannelScrub);
    }

    /**
     * Return the amount of seconds left.
     *
     * It does this by getting the remaining time in the format (HH:)MM:SS,
     * splitting it up and reversing it. Each part is then multiplied by
     * 60 to the power of its index. This way an hour is multiplied by 3600
     * or 60^2 and minutes by 60.
     */
    getSeconds() {
        const time = document.querySelector(`.${REMAINING_TIME_CLASS}`)
            .textContent;
        const timeParts = time.split(":");
        let seconds = 0;
        timeParts.reverse().forEach((element, index) => {
            seconds += parseInt(element) * Math.pow(60, index);
        });
        return seconds;
    }

    sendEvent(mutation) {
        apolloClient
            .mutate({
                mutation: mutation,
                variables: {
                    seconds: seconds,
                },
            })
            .then(result => {
                console.log(result);
            })
            .catch(error => {
                console.error(error);
            });
    }

    onLocalPlay() {
        sendEvent(play);
    }

    onChannelPlay(event) {}

    onLocalPause() {
        sendEvent(play);
    }

    onChannelPause(event) {}

    onLocalScrub() {}

    onChannelScrub(event) {}
}

new Player();
