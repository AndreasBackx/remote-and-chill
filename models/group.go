package models

import (
	"github.com/satori/go.uuid"
)

type Group struct {
	ID      uuid.UUID `json:"id"`
	Name    string    `json:"name"`
	Owner   *User     `json:"owner"`
	Members []*User   `json:"members"`
}

func NewGroup(name string, owner *User) *Group {
	return &Group{
		ID:      uuid.NewV4(),
		Name:    name,
		Owner:   owner,
		Members: []*User{owner},
	}
}
