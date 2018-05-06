package main

import (
	"context"
	"fmt"
	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"
	"github.com/satori/go.uuid"
	"net/http"
)

func executeQuery(query string, schema graphql.Schema) *graphql.Result {
	result := graphql.Do(graphql.Params{
		Schema:        schema,
		RequestString: query,
	})
	if len(result.Errors) > 0 {
		fmt.Printf("wrong result, unexpected errors: %v", result.Errors)
	}
	return result
}

type ContextKey int

const (
	Me ContextKey = iota
)

func apiHandler(writer http.ResponseWriter, request *http.Request) {
	secretString := request.Header.Get("Authorization")
	secret, err := uuid.FromString(secretString)
	var ctx context.Context
	fmt.Printf("Received the secret string '%v'.\n", secretString)

	if err != nil {
		fmt.Println("Did not receive a proper secret.")
		fmt.Printf("Error '%v'.\n", err)
	} else {
		fmt.Printf("Received the secret '%v'.\n", secret)
		for _, user := range users {
			fmt.Printf("\tTrying user '%v' '%v'.\n", user.Name, user.Secret)
			if user.Secret == secret {
				fmt.Println("\t\tFound!")
				ctx = context.WithValue(request.Context(), Me, user)
				break
			}
		}
	}

	graphqlHandler := handler.New(&handler.Config{
		Schema:   &Schema,
		Pretty:   false,
		GraphiQL: false,
	})

	if ctx != nil {
		fmt.Println("With context.")
		graphqlHandler.ServeHTTP(writer, request.WithContext(ctx))
	} else {
		fmt.Println("Without context.")
		graphqlHandler.ServeHTTP(writer, request)
	}
}

func main() {
	http.HandleFunc("/", apiHandler)

	fmt.Println("Starting server...")
	http.ListenAndServe(":8080", nil)
}
