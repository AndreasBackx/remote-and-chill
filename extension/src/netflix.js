import ApolloClient from "apollo-boost";

const client = new ApolloClient();

const PLAY_CLASS = "button-nfplayerPlay";
const PAUSE_CLASS = "button-nfplayerPause";

class Player {
    constructor() {
        document.addEventListener("click", event => {
            console.log(event);
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
    }

    onPause() {
        console.log("onPause");
    }
}

new Player();
