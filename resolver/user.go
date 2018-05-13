package resolver

import (
	"context"
	"errors"
	"github.com/AndreasBackx/remote-and-chill/model"
	graphql "github.com/graph-gophers/graphql-go"
)

type UserResolver struct {
	user       *model.User
	showSecret bool
}

func (r *UserResolver) ID() graphql.ID {
	return graphql.ID(r.user.ID.String())
}

// TODO Proper nil usage.
func (r *UserResolver) Secret(ctx context.Context) (*graphql.ID, error) {
	if !r.showSecret {
		return nil, errors.New("User secrets can only be requested on creation")
	}

	tmp := graphql.ID(r.user.Secret.String())
	return &tmp, nil
}

func (r *UserResolver) Name() string {
	return r.user.Name
}
func (r *UserResolver) CreatedAt() graphql.Time {
	return graphql.Time{Time: r.user.CreatedAt}
}

func (r *UserResolver) ExpiresAt() graphql.Time {
	return graphql.Time{Time: r.user.ExpiresAt}
}

func (r *UserResolver) Group() (*GroupResolver, error) {
	group, err := r.user.Group()

	if group == nil {
		return nil, err
	}
	return &GroupResolver{group}, err
}
