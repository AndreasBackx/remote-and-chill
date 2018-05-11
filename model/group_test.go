package model

import (
	"github.com/satori/go.uuid"
	"testing"
)

func setupGroupTests() {
	setupUserTests()

	Groups = []*Group{}
}

func TestGroupLeave(t *testing.T) {
	setupGroupTests()

	firstOwner := NewUser("First Owner")
	secondOwner := NewUser("Second Owner")
	user := NewUser("User")

	group := NewGroup("Name", firstOwner)
	group.Join(secondOwner)
	group.Join(user)

	err := group.Leave(firstOwner)
	if err != nil {
		t.Fatal(err)
	}

	for _, member := range group.Members {
		if member == firstOwner {
			t.Fatal("The first owner is still a member of the group after leaving")
		}
	}

	if group.Owner != secondOwner {
		t.Fatal("The ownership of the group was not transferred to the second owner.")
	}

	err = group.Leave(user)
	if err != nil {
		t.Fatal(err)
	}

	for _, member := range group.Members {
		if member == user {
			t.Fatal("The user is still a member of the group after leaving")
		}
	}

	if group.Owner != secondOwner {
		t.Fatalf("The ownership of the group was transferred away from the second owner to %v.", group.Owner.Name)
	}

	err = group.Leave(secondOwner)
	if len(group.Members) != 0 {
		t.Fatalf("The members of the group is not empty after all users left, there are still %v users left.", len(group.Members))
	}

	g, err := GetGroup(group.ID)
	if g != nil || err == nil {
		t.Fatal("The group was not deleted after all of users left.")
	}
}
func TestGroupJoin(t *testing.T) {
	owner := NewUser("Owner")
	group := NewGroup("Name", owner)

	err := group.Join(owner)
	if err == nil {
		t.Fatal("Joining a group where the user is already a member does not return an error.")
	}

	user := NewUser("User")
	err = group.Join(user)
	if err != nil {
		t.Fatalf("Joining a group where the user is not already a member returns an error: %v\n", err)
	}
}

func TestGroupDelete(t *testing.T) {
	setupGroupTests()

	owner := NewUser("Owner")
	group := NewGroup("Name", owner)

	group.Delete()

	if len(Groups) != 0 {
		t.Fatal("Group.Delete did not delete the group from the list of groups.")
	}
}

func TestNewGroup(t *testing.T) {
	setupGroupTests()

	if len(Groups) != 0 {
		t.Fatal("The list of groups does not start with an empty list.")
	}

	owner := NewUser("Owner")
	NewGroup("Name", owner)

	if len(Groups) != 1 {
		t.Fatal("NewGroup did not add the group to the list of groups.")
	}
}

func TestGetGroup(t *testing.T) {
	setupGroupTests()

	invalidID := uuid.UUID{}

	g, err := GetGroup(invalidID)
	if g != nil || err == nil {
		t.Fatal("GetGroup returned a group or no error with no groups.")
	}

	owner := NewUser("Owner")
	group := NewGroup("Name", owner)

	g, err = GetGroup(invalidID)
	if g != nil || err == nil {
		t.Fatal("GetGroup returned a group or no error with an invalid ID.")
	}

	g, err = GetGroup(group.ID)
	if g != group || err != nil {
		t.Fatal("GetGroup returned a different group or an error with a valid ID.")
	}
}
