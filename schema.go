//go:generate packr
package main

import (
	"github.com/gobuffalo/packr"
	"path/filepath"
)

func SchemaString() string {
	box := packr.NewBox("./schema")
	schema := ""

	for _, filename := range box.List() {
		extension := filepath.Ext(filename)
		if extension == ".graphql" {
			schema += box.String(filename)
		}
	}
	return schema
}
