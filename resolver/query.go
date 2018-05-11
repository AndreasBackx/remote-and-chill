package resolver

import (
	"context"
	"github.com/AndreasBackx/remote-and-chill/model"
)

// Me returns the currently authenticated user.
func (resolver *Resolver) Me(ctx context.Context) (*UserResolver, error) {
	me, err := model.AuthenticatedUser(ctx, Me)

	if err != nil {
		return nil, err
	}
	return &UserResolver{me, false}, nil
}
