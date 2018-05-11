package resolver

import (
	"github.com/AndreasBackx/remote-and-chill/model"
	graphql "github.com/graph-gophers/graphql-go"
)

type GroupResolver struct {
	group *model.Group
}

func (r *GroupResolver) ID() graphql.ID {
	return graphql.ID(r.group.ID.String())
}

func (r *GroupResolver) Name() string {
	return r.group.Name
}

func (r *GroupResolver) Owner() *UserResolver {
	return &UserResolver{r.group.Owner, false}
}

func (r *GroupResolver) Members() []*UserResolver {
	members := []*UserResolver{}
	for _, member := range r.group.Members {
		members = append(members, &UserResolver{member, false})
	}
	return members
}
