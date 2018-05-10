package resolver

import (
	"github.com/AndreasBackx/remote-and-chill/model"
)

type groupResponseResolver struct {
	response   *model.GroupResponse
	showSecret bool
}

func (r *groupResponseResolver) User() *userResolver {
	return &userResolver{r.response.User, true}
}

func (r *groupResponseResolver) Group() *groupResolver {
	return &groupResolver{r.response.Group}
}
