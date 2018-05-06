package main

import (
	"errors"
	"github.com/AndreasBackx/remote-and-chill/models"
	"github.com/graphql-go/graphql"
)

var User = graphql.NewObject(graphql.ObjectConfig{
	Name: "User",
	Fields: graphql.Fields{
		"id": &graphql.Field{
			Type:        graphql.NewNonNull(graphql.ID),
			Description: "UUID of the user.",
		},
		"secret": &graphql.Field{
			Type:        graphql.NewNonNull(graphql.ID),
			Description: "Secret UUID of the user for authentication. Only visible for the authenticated user itself.",
		},
		"name": &graphql.Field{
			Type:        graphql.NewNonNull(graphql.String),
			Description: "Name of the user.",
		},
		"expiresAt": &graphql.Field{
			Type:        graphql.NewNonNull(graphql.DateTime),
			Description: "Moment when user is deleted/forgotten.",
		},
	},
})

var Group = graphql.NewObject(graphql.ObjectConfig{
	Name: "Group",
	Fields: graphql.Fields{
		"id": &graphql.Field{
			Type:        graphql.NewNonNull(graphql.ID),
			Description: "UUID of the group.",
		},
		"name": &graphql.Field{
			Type:        graphql.NewNonNull(graphql.String),
			Description: "Name of the group.",
		},
		"owner": &graphql.Field{
			Type:        graphql.NewNonNull(User),
			Description: "Creator of the group or another user if the creator left.",
		},
		"members": &graphql.Field{
			Type:        graphql.NewNonNull(graphql.NewList(User)),
			Description: "Moment when user is deleted/forgotten.",
		},
	},
})

var GroupResponse = graphql.NewObject(graphql.ObjectConfig{
	Name: "GroupResponse",
	Fields: graphql.Fields{
		"user": &graphql.Field{
			Type: graphql.NewNonNull(User),
		},
		"group": &graphql.Field{
			Type: graphql.NewNonNull(Group),
		},
	},
})

// TODO Implement mutexes.
var users = []*models.User{}
var groups = []*models.Group{}

var Mutation = graphql.NewObject(graphql.ObjectConfig{
	Name: "Mutation",
	Fields: graphql.Fields{
		"createGroup": &graphql.Field{
			Type: graphql.NewNonNull(GroupResponse),
			Args: graphql.FieldConfigArgument{
				"name": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
				"userName": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(params graphql.ResolveParams) (interface{}, error) {
				name, _ := params.Args["name"].(string)

				if name == "" {
					return nil, errors.New("Name of a group cannot be empty")
				}

				userName, _ := params.Args["userName"].(string)

				if userName == "" {
					return nil, errors.New("Name of a user cannot be empty")
				}

				user := models.NewUser(userName)
				users = append(users, user)
				group := models.NewGroup(name, user)
				groups = append(groups, group)

				return models.NewGroupResponse(group, user), nil
			},
		},
	},
})

var Query = graphql.NewObject(graphql.ObjectConfig{
	Name: "Query",
	Fields: graphql.Fields{
		"me": &graphql.Field{
			Type: User,
			Resolve: func(params graphql.ResolveParams) (interface{}, error) {
				me := params.Context.Value(Me)

				if me == nil {
					return nil, errors.New("Not authenticated")
				}
				return me, nil
			},
		},
	},
})

var Schema, err = graphql.NewSchema(graphql.SchemaConfig{
	Query:    Query,
	Mutation: Mutation,
})
