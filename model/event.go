package model

const (
	Play  string = "play"
	Pause string = "pause"
	Scrub string = "scrub"
)

type Event struct {
	Seconds int `json:"seconds"`
}
