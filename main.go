package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/AndreasBackx/remote-and-chill/model"
	"github.com/AndreasBackx/remote-and-chill/resolver"
	graphql "github.com/graph-gophers/graphql-go"
	"github.com/satori/go.uuid"
	"log"
	"net/http"
)

func apiHandler(writer http.ResponseWriter, request *http.Request) {
	secretString := request.Header.Get("Authorization")
	secret, err := uuid.FromString(secretString)
	ctx := request.Context()
	fmt.Printf("Received the secret string '%v'.\n", secretString)

	if err != nil {
		fmt.Println("Did not receive a proper secret.")
		fmt.Printf("Error '%v'.\n", err)
	} else {
		fmt.Printf("Received the secret '%v'.\n", secret)
		for _, user := range model.Users {
			fmt.Printf("\tTrying user '%v' '%v'.\n", user.Name, user.Secret)
			if user.Secret == secret {
				fmt.Println("\t\tFound!")
				ctx = context.WithValue(request.Context(), resolver.Me, user)
				break
			}
		}
	}

	var params struct {
		Query         string                 `json:"query"`
		OperationName string                 `json:"operationName"`
		Variables     map[string]interface{} `json:"variables"`
	}
	if err := json.NewDecoder(request.Body).Decode(&params); err != nil {
		fmt.Println(err)
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	schema := graphql.MustParseSchema(SchemaString(), &resolver.Resolver{})
	response := schema.Exec(ctx, params.Query, params.OperationName, params.Variables)
	responseJSON, err := json.Marshal(response)
	if err != nil {
		fmt.Println(err)
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	writer.Write(responseJSON)

	// graphqlHandler := handler.New(&handler.Config{
	// 	Schema:   &Schema,
	// 	Pretty:   false,
	// 	GraphiQL: false,
	// })

	// if ctx != nil {
	// 	fmt.Println("With context.")
	// 	graphqlHandler.ServeHTTP(writer, request.WithContext(ctx))
	// } else {
	// 	fmt.Println("Without context.")
	// 	graphqlHandler.ServeHTTP(writer, request)
	// }
}

func main() {
	// fmt.Println(SchemaString())
	http.HandleFunc("/", apiHandler)

	fmt.Println("Starting server...")
	log.Fatal(http.ListenAndServe(":3000", nil))
}
