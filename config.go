package main

import (
	"encoding/json"
	"io/ioutil"
)

type Config struct {
	Pusher PusherConfig `json:"pusher"`
}

type PusherConfig struct {
	AppId   string `json:"appId"`
	Key     string `json:"key"`
	Secret  string `json:"secret"`
	Host    string `json:"host"`
	Secure  bool   `json:"secure"`
	Cluster string `json:"cluster"`
}

// DefaultConfig to be used when parsing config files.
var DefaultConfig = Config{
	Pusher: PusherConfig{
		Secure:  true,
		Host:    "api.pusherapp.com",
		Cluster: "eu",
	},
}

func LoadConfig(filename string) (*Config, error) {
	file, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	config := DefaultConfig
	json.Unmarshal(file, &config)

	return &config, nil
}
