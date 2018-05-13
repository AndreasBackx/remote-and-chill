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
}) (*GroupResponseResolver, error) {

	if args.Name == "" {
		return nil, errors.New("Name of a group cannot be empty")
	}

	if args.UserName == "" {
		return nil, errors.New("Name of a user cannot be empty")
	}

	user := model.NewUser(args.UserName)
	group := model.NewGroup(args.Name, user)
	response := model.NewGroupResponse(group, user)

	return &GroupResponseResolver{response, false}, nil
}

func (resolver *Resolver) JoinGroup(ctx context.Context, args *struct {
	GroupID  string
	UserName string
}) (*GroupResponseResolver, error) {
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

	err = group.Join(user)
	if err != nil {
		return nil, err
	}

	response := model.NewGroupResponse(group, user)

	return &GroupResponseResolver{response, false}, nil
}

func (resolver *Resolver) LeaveGroup(ctx context.Context, args *struct{}) (*GroupResponseResolver, error) {
	me, err := model.AuthenticatedUser(ctx, Me)
	if err != nil {
		return nil, err
	}

	group, err := me.Group()
	if err != nil {
		return nil, err
	}

	group.Leave(me)
	response := model.NewGroupResponse(group, nil)

	return &GroupResponseResolver{response, false}, nil
}

func (resolver *Resolver) DeleteGroup(ctx context.Context, args *struct{}) (bool, error) {
	me, err := model.AuthenticatedUser(ctx, Me)
	if err != nil {
		return false, err
	}

	group, err := me.Group()
	if err != nil {
		return false, err
	}

	if group.Owner != me {
		return false, errors.New("Only owners of a group can delete the group")
	}

	group.Delete()
	return true, nil
}

func (resolver *Resolver) Play(ctx context.Context, args *struct {
	Seconds int
}) (bool, error) {

	return trigger(ctx, args.Seconds, model.Play)
}

func (resolver *Resolver) Pause(ctx context.Context, args *struct {
	Seconds int
}) (bool, error) {
	return trigger(ctx, args.Seconds, model.Pause)
}

func (resolver *Resolver) Scrub(ctx context.Context, args *struct {
	Seconds int
}) (bool, error) {
	return trigger(ctx, args.Seconds, model.Scrub)
}

func trigger(ctx context.Context, seconds int, event string) (bool, error) {
	if seconds < 0 {
		return false, errors.New("Seconds cannot be less than 0")
	}

	me, err := model.AuthenticatedUser(ctx, Me)
	if err != nil {
		return false, err
	}

	group, err := me.Group()
	if err != nil {
		return false, err
	}

	_, err = pusherClient.Trigger(group.ID.String(), model.Play, model.Event{
		Seconds: seconds,
	})

	if err != nil {
		return false, err
	}

	return true, nil
}
