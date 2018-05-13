package resolver

import "github.com/pusher/pusher-http-go"

var pusherClient pusher.Client

// Setup the resolver package with the necessities.
func Setup(client pusher.Client) {
	pusherClient = client
}
