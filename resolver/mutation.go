package resolver

import (
	"context"
	"errors"
	"github.com/AndreasBackx/remote-and-chill/model"
	"github.com/satori/go.uuid"
)

func (resolver *Resolver) CreateGroup(ctx context.Context, args *struct {
	Name     string
	UserName string
}) (*groupResponseResolver, error) {

	if args.Name == "" {
		return nil, errors.New("Name of a group cannot be empty")
	}

	if args.UserName == "" {
		return nil, errors.New("Name of a user cannot be empty")
	}

	user := model.NewUser(args.UserName)
	model.Users = append(model.Users, user)
	group := model.NewGroup(args.Name, user)
	model.Groups = append(model.Groups, group)
	response := model.NewGroupResponse(group, user)

	return &groupResponseResolver{response, false}, nil
}

func (resolver *Resolver) JoinGroup(ctx context.Context, args *struct {
	GroupID  string
	UserName string
}) (*groupResponseResolver, error) {
	groupID, err := uuid.FromString(args.GroupID)
	if err != nil {
		return nil, errors.New("Invalid group ID")
	}

	if args.UserName == "" {
		return nil, errors.New("Name of a user cannot be empty")
	}

	user := model.NewUser(args.UserName)
	model.Users = append(model.Users, user)

	var group *model.Group
	for _, g := range model.Groups {
		if g.ID == groupID {
			group = g
		}
	}
	if group == nil {
		return nil, errors.New("Group does not exist")
	}

	// TODO Mutexes
	group.Members = append(group.Members, user)
	response := model.NewGroupResponse(group, user)

	return &groupResponseResolver{response, false}, nil
}
