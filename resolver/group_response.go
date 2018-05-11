package resolver

import (
	"github.com/AndreasBackx/remote-and-chill/model"
)

type GroupResponseResolver struct {
	response   *model.GroupResponse
	showSecret bool
}

func (r *GroupResponseResolver) User() *UserResolver {
	return &UserResolver{r.response.User, true}
}

func (r *GroupResponseResolver) Group() *GroupResolver {
	return &GroupResolver{r.response.Group}
}
