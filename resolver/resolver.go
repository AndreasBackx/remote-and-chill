package resolver

type ContextKey int

const (
	Me ContextKey = iota
	ForceShowSecret
)

type Resolver struct{}
