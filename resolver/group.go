package resolver

import (
	"github.com/AndreasBackx/remote-and-chill/model"
	graphql "github.com/graph-gophers/graphql-go"
)

type groupResolver struct {
	group *model.Group
}

func (r *groupResolver) ID() graphql.ID {
	return graphql.ID(r.group.ID.String())
}

func (r *groupResolver) Name() string {
	return r.group.Name
}

func (r *groupResolver) Owner() *userResolver {
	return &userResolver{r.group.Owner, false}
}

func (r *groupResolver) Members() []*userResolver {
	members := []*userResolver{}
	for _, member := range r.group.Members {
		members = append(members, &userResolver{member, false})
	}
	return members
}
