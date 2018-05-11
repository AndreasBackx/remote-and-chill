package model

import (
	"errors"
	"github.com/satori/go.uuid"
)

// Groups are the groups of people watching movies.
var Groups []*Group

// Group contains a group of users that are watching a movie together.
// The group is deleted when no members remain.
type Group struct {
	ID      uuid.UUID `json:"id"`
	Name    string    `json:"name"`
	Owner   *User     `json:"owner"`
	Members []*User   `json:"members"`
}

func (group *Group) String() string {
	return group.Name
}

// Leave removes a member from the group and deletes the group if no members remain.
// If the owner is removed, the next member will become the owner.
// Leaving a group deletes the user as well.
func (group *Group) Leave(user *User) error {
	for index, member := range group.Members {
		if member == user {
			group.Members = append(group.Members[:index], group.Members[index+1:]...)
			if len(group.Members) == 0 {
				group.Delete()
			} else if group.Owner == user {
				// This is technically always the index 0, but writing it this way is more friendly.
				// It uses index and not index + 1 because the user was already removed.
				group.Owner = group.Members[index]
			}
			user.Delete()
			return nil
		}
	}
	return errors.New("That user was not part of this group")
}

// Join a group as a user,
func (group *Group) Join(user *User) error {
	for _, member := range group.Members {
		if member == user {
			return errors.New("That user is already part of this group")
		}
	}

	// TODO Mutexes
	group.Members = append(group.Members, user)

	return nil
}

// Delete the group from the list of groups.
func (group *Group) Delete() {
	for _, user := range group.Members {
		user.Delete()
	}

	for index, g := range Groups {
		if g == group {
			Groups = append(Groups[:index], Groups[index+1:]...)
			return
		}
	}
}

// NewGroup creates a new group and adds it to the list of groups.
func NewGroup(name string, owner *User) *Group {
	group := &Group{
		ID:      uuid.NewV4(),
		Name:    name,
		Owner:   owner,
		Members: []*User{owner},
	}
	// TODO Mutexes
	Groups = append(Groups, group)
	return group
}

// GetGroup gets a group from the list of groups based on ID.
func GetGroup(ID uuid.UUID) (*Group, error) {
	for _, group := range Groups {
		if group.ID == ID {
			return group, nil
		}
	}
	return nil, errors.New("Group does not exist")
}
