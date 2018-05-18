import ApolloClient from "apollo-boost";
import gql from "graphql-tag";

const client = new ApolloClient({
    uri: "http://localhost:3000",
});

const PLAY_CLASS = "button-nfplayerPlay";
const PAUSE_CLASS = "button-nfplayerPause";

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
    }

    onPlay() {
        console.log("onPlay");

        client
            .mutate({
                mutation: gql`
                    mutation {
                        createGroup(name: "Group 1", userName: "Owner") {
                            user {
                                id
                                secret
                                name
                                expiresAt
                                group {
                                    name
                                }
                            }
                            group {
                                id
                                name
                                owner {
                                    name
                                }
                                members {
                                    name
                                }
                            }
                        }
                    }
                `,
            })
            .then(data => console.log(data))
            .catch(error => console.error(error));
    }

    onPause() {
        console.log("onPause");
    }
}

new Player();
