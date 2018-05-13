package model

import (
	"context"
	"errors"
	"github.com/satori/go.uuid"
	"time"
)

// Users are the current users that belong to a group watching a movie.
var Users []*User

// User is a user watching a movie with someone in a group.
type User struct {
	ID        uuid.UUID `json:"id"`
	Secret    uuid.UUID `json:"secret"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	ExpiresAt time.Time `json:"expiresAt"`
}

var expirationDuration = time.Hour * time.Duration(1)

// Group returns the group the user is a member of.
func (user *User) Group() (*Group, error) {
	for _, group := range Groups {
		for _, member := range group.Members {
			if member == user {
				return group, nil
			}
		}
	}
	return nil, errors.New("User does not belong to a group? This should never be the case")
}

// Delete the group from the list of users.
func (user *User) Delete() {
	for index, u := range Users {
		if u == user {
			Users = append(Users[:index], Users[index+1:]...)
			return
		}
	}
}

// NewUSer creates a new user and adds it to the list of users.
func NewUser(name string) *User {
	user := &User{
		ID:        uuid.NewV4(),
		Secret:    uuid.NewV4(),
		Name:      name,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(expirationDuration),
	}
	Users = append(Users, user)
	return user
}

// Login checks the passed secret UUID and adds the corresponding user to the
// passed context with the given key.
func Login(secret uuid.UUID, ctx context.Context, key interface{}) (context.Context, bool) {
	for _, user := range Users {
		if user.Secret == secret {
			ctx = context.WithValue(ctx, key, user)
			return ctx, true
		}
	}
	return ctx, false
}

// AuthenticatedUser returns the currently authenticated user in the context if there is one.
func AuthenticatedUser(ctx context.Context, key interface{}) (*User, error) {
	user := ctx.Value(key)

	if user == nil {
		return nil, errors.New("Not authenticated")
	}
	return user.(*User), nil
}
