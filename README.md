# Remote and Chill

Remote and Chill is a proof-of-concept Google Chrome and Firefox extension to allow for a group of people to watch movies together at exactly the same time.

## Features

As this was mainly a short side-project and a proof-of-concept. It's still missing some features that I had laid out for it.

- [x] Plex support
    
    - [x] Detecting pause/play/scrubbing.
    - [x] Pause/play/scrub the player when an update is received.
    
        _Some (including mine) Plex Media Servers' `/clients` endpoint returns no clients resulting in a 500 Internal Server error when trying to use the Remote Control API. It seems to work on other Plex Media Servers, but this needs to be looked at._
        
- [x] Basic usage.
- [ ] Account for round-trip delay time so clients all play at the **exact** same time. Something similar to NTP.
- [ ] Automatically logout when opening the popup when the group is deleted.

## Configuration

In order to get started, you have to clone the entire repository. An easy-to-use command has not yet been fleshed out yet.

```shell
git clone git@github.com:AndreasBackx/remote-and-chill.git
```

### Backend

Remote and Chill uses [Pusher Channels](https://pusher.com/docs/client_api_guide/client_channels) to push information about the status of the video to the group members. So it requires a Pusher account with a Channel app.

To get started, install the dependencies using dep:

```shell
dep ensure
```

Besides that, only a configuration file is required in order to get started. Below is an example of the configuration file, it needs to be named `config.json` in the root project folder. See [`config.go`](config.go) for all of the configuration options.

```javascript
{
    "pusher": {
        "appId": "123456",
        "key": "987654321",
        "secret": "123456789",
        "cluster": "eu", // optional, default "eu".
    }
}
```

In order to run, simply run the `realize start` command which will run all of the necessary commands. See [Realize](https://github.com/oxequa/realize) and [`.realize.yaml`](.realize.yaml) for more info.

### Extension

See [`extension/README.md`](extension/README.md).
