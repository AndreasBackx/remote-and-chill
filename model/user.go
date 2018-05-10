package model

import (
	"github.com/satori/go.uuid"
	"time"
)

var Users []*User

type User struct {
	ID        uuid.UUID `json:"id"`
	Secret    uuid.UUID `json:"secret"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	ExpiresAt time.Time `json:"expiresAt"`
}

var expirationDuration = time.Hour * time.Duration(1)

func NewUser(name string) *User {
	return &User{
		ID:        uuid.NewV4(),
		Secret:    uuid.NewV4(),
		Name:      name,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(expirationDuration),
	}
}
