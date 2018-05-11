package model

import (
	"context"
	"github.com/satori/go.uuid"
	"testing"
)

func setupUserTests() {
	Users = []*User{}
}

func TestUserDelete(t *testing.T) {
	setupUserTests()

	if len(Users) != 0 {
		t.Fatal("The list of users does not start with an empty list.")
	}
	user := NewUser("Name")

	user.Delete()

	if len(Users) != 0 {
		t.Fatal("User.Delete did not delete the user from the list of users.")
	}
}

func TestNewUser(t *testing.T) {
	setupUserTests()

	if len(Users) != 0 {
		t.Fatal("The list of users does not start with an empty list.")
	}

	NewUser("Name")

	if len(Users) != 1 {
		t.Fatal("NewUser did not add the user to the list of users.")
	}
}

func TestLogin(t *testing.T) {
	setupUserTests()

	ctx := context.Background()
	key := 0
	secret := uuid.UUID{}

	ctx, success := Login(secret, ctx, key)
	if success {
		t.Fatal("Login succeeded with no users.")
	}

	value := ctx.Value(key)
	if value != nil {
		t.Fatal("Context contained a user, but login failed.")
	}

	user := NewUser("Name")
	_, success = Login(secret, ctx, key)
	if success {
		t.Fatal("Login succeeded with invalid secret.")
	}

	value = ctx.Value(key)
	if value != nil {
		t.Fatal("Context contained a user, but login failed.")
	}

	ctx, success = Login(user.Secret, ctx, key)
	if !success {
		t.Fatal("Login failed with valid secret.")
	}

	value = ctx.Value(key)
	if value == nil {
		t.Fatal("Context did not contain logged in user.")
	}

	u, ok := value.(*User)
	if !ok || u != user {
		t.Fatal("The context did not contain the exact pointer to the logged in user.")
	}
}

func TestAuthenticatedUser(t *testing.T) {
	setupUserTests()

	ctx := context.Background()
	key := 0

	user, err := AuthenticatedUser(ctx, key)
	if user != nil || err == nil {
		t.Fatalf("TestAuthenticatedUser returned a user or no error when no user was added in the context.\nuser: %v\nerr: %v\n", user, err)
	}

	ctx = context.WithValue(ctx, key, NewUser("Name"))
	user, err = AuthenticatedUser(ctx, key)
	if user == nil || err != nil {
		t.Fatalf("TestAuthenticatedUser returned no user or an error when a user was added in the context.\nuser: %v\nerr: %v\n", user, err)
	}
}
