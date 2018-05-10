package resolver

import (
	"context"
	"errors"
	"github.com/AndreasBackx/remote-and-chill/model"
)

func (resolver *Resolver) Me(ctx context.Context) (*userResolver, error) {
	me := ctx.Value(Me)

	if me != nil {
		return &userResolver{me.(*model.User), false}, nil
	}
	return nil, errors.New("Unauthenticated")
}
