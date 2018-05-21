export default class Plex {
    constructor(onStateChange) {
        this.onStateChange = onStateChange;
    }

    static get PLAYING() {
        return "playing";
    }

    static get PAUSED() {
        return "paused";
    }

    static get STOPPED() {
        return "stopped";
    }

    getConnectionInfo() {
        const userStorage = localStorage.getItem("users");

        if (!userStorage) {
            console.warn('localStorage did not contain the key "users".');
            return {};
        }

        let users;
        try {
            const storageData = JSON.parse(userStorage);
            users = storageData["users"];
        } catch (exception) {
            console.error(exception);
        }

        if (!users) {
            console.warn("localStorage did not contain any users.");
            return {};
        }

        for (const user of users) {
            const lastMachineIdentifier = user.lastPrimaryServerID;
            for (const server of user.servers) {
                if (server.machineIdentifier === lastMachineIdentifier) {
                    for (const connection of server.connections) {
                        // Replace http(s) protocol with ws(s).
                        return {
                            accessToken: server.accessToken,
                            machineIdentifier: server.machineIdentifier,
                            uri: connection.uri,
                            websocketUri: connection.uri.replace(/^http/, "ws"),
                        };
                    }
                }
            }
        }
        console.warn("Couldn't find any Plex connections.");
        return {};
    }

    startListening() {
        if (this.socket) {
            console.warn(
                "Plex.startListening was called when there already is a socket listening."
            );
            return;
        }

        this.stop = false;

        const { accessToken, websocketUri } = this.getConnectionInfo();

        if (!accessToken || !websocketUri) {
            return;
        }

        this.socket = new WebSocket(
            `${websocketUri}/:/websockets/notifications?X-Plex-Token=${accessToken}`
        );
        this.socket.onopen = event => {
            this.onSocketOpen(event);
        };
        this.socket.onclose = event => {
            this.onSocketClose(event);
        };
        this.socket.onmessage = message => {
            this.onSocketMessage(message);
        };
    }

    stopListening() {
        this.stop = true;

        if (!this.socket) {
            console.warn("Was asked to stop listening, but no socket defined.");
            return;
        }

        const CLOSING = 2;
        const CLOSED = 3;
        if ([CLOSING, CLOSED].includes(this.socket.readyState)) {
            console.warn(
                "Was asked to stop listening, but the socket is already closing or is closed."
            );
            return;
        }

        this.socket.close();
    }

    onSocketOpen(event) {
        console.debug("The socket was opened to Plex.");
        console.debug(event);
    }

    onSocketClose(event) {
        this.socket = null;

        if (!this.stop) {
            console.warn(
                "The socket was closed to Plex, restarting the connection..."
            );
            console.debug(event);
            this.startListening();
        } else {
            console.warn("The socket was manually closed to Plex.");
        }
    }

    onSocketMessage(message) {
        const data = JSON.parse(message.data);

        const notificationContainer = data.NotificationContainer;
        if (!notificationContainer) {
            console.warn("No NotificationContainer passed in message data.");
            return;
        }

        if (notificationContainer.type === "playing") {
            const notifications =
                notificationContainer.PlaySessionStateNotification;

            for (const notification of notifications) {
                const state = notification.state;
                const viewOffset = notification.viewOffset;

                if (
                    !this.oldNotification ||
                    this.oldNotification.state !== state
                ) {
                    this.onStateChange(notification, this.oldNotification);
                    this.oldNotification = notification;
                }
            }
        }
    }

    sendCommand(command, params) {
        const {
            accessToken,
            machineIdentifier,
            uri,
        } = this.getConnectionInfo();
        params = "&type=video" + (params || "");
        return fetch(
            `${uri}/player/${command}?X-Plex-Token=${accessToken}&X-Plex-Target-Client-Identifier=${machineIdentifier}${params}`
        );
    }

    seekTo(viewOffset) {
        this.sendCommand("timeline/seekTo", `&offset=${viewOffset}`)
            .then(response => {
                console.debug(`Successfully seeked to ${viewOffset}.`);
                console.debug(response);
            })
            .catch(error => {
                console.error(error);
            });
    }

    play() {
        this.sendCommand("playback/play")
            .then(response => {
                console.debug(`Successfully started playing.`);
                console.debug(response);
            })
            .catch(error => {
                console.error(error);
            });
    }

    pause() {
        this.sendCommand("playback/pause")
            .then(response => {
                console.debug(`Successfully paused.`);
                console.debug(response);
            })
            .catch(error => {
                console.error(error);
            });
    }
}
