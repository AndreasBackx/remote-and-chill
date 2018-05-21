package main

import (
	"encoding/json"
	"fmt"
	"github.com/AndreasBackx/remote-and-chill/model"
	"github.com/AndreasBackx/remote-and-chill/resolver"
	graphql "github.com/graph-gophers/graphql-go"
	"github.com/pusher/pusher-http-go"
	"github.com/rs/cors"
	"github.com/satori/go.uuid"
	"github.com/sirupsen/logrus"
	"log"
	"net/http"
)

func apiHandler(writer http.ResponseWriter, request *http.Request) {
	fmt.Printf("%s %s\n", request.Method, request.RequestURI)

	authorization := request.Header.Get("Authorization")
	secret, err := uuid.FromString(authorization)
	ctx := request.Context()

	if err == nil {
		ctx, _ = model.Login(secret, ctx, resolver.Me)
	}

	var params struct {
		Query         string                 `json:"query"`
		OperationName string                 `json:"operationName"`
		Variables     map[string]interface{} `json:"variables"`
	}
	if err := json.NewDecoder(request.Body).Decode(&params); err != nil {
		logrus.Error(err)
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	schema := graphql.MustParseSchema(SchemaString(), &resolver.Resolver{})
	// fmt.Printf("%v\n", params.Query)
	// fmt.Printf("%v\n", params.Variables)
	response := schema.Exec(ctx, params.Query, params.OperationName, params.Variables)
	responseJSON, err := json.Marshal(response)
	if err != nil {
		logrus.Error(err)
		http.Error(writer, err.Error(), http.StatusInternalServerError)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	writer.Write(responseJSON)
}

func main() {
	config, err := LoadConfig("config.json")
	if err != nil {
		log.Fatal(err)
	}

	client := pusher.Client{
		AppId:   config.Pusher.AppId,
		Key:     config.Pusher.Key,
		Secret:  config.Pusher.Secret,
		Host:    config.Pusher.Host,
		Secure:  config.Pusher.Secure,
		Cluster: config.Pusher.Cluster,
	}
	resolver.Setup(client)

	log.Fatal(
		http.ListenAndServe(
			":3000",
			cors.AllowAll().Handler(
				http.HandlerFunc(apiHandler),
			),
		),
	)
}
