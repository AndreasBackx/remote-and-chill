package models

import (
	"github.com/satori/go.uuid"
	"time"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	Secret    uuid.UUID `json:"secret"`
	Name      string    `json:"name"`
	ExpiresAt time.Time `json:"expiresAt"`
}

var expirationDuration = time.Hour * time.Duration(1)

func NewUser(name string) *User {
	return &User{
		ID:        uuid.NewV4(),
		Secret:    uuid.NewV4(),
		Name:      name,
		ExpiresAt: time.Now().Add(expirationDuration),
	}
}
