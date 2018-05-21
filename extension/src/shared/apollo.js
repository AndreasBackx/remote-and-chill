import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { from } from "apollo-link";
import { setContext } from "apollo-link-context";
import { HttpLink } from "apollo-link-http";

const httpLink = new HttpLink({
    uri: "http://localhost:3000",
});

const authMiddleware = setContext((operation, { headers }) => {
    return browser.storage.local
        .get("me")
        .then(data => ({
            headers: {
                ...headers,
                Authorization: data.me.secret,
            },
        }))
        .catch(error => {
            console.warn("Not yet authenticated.");
            return {
                headers: {
                    ...headers,
                },
            };
        });
});

const apolloClient = new ApolloClient({
    link: from([authMiddleware, httpLink]),
    cache: new InMemoryCache(),
});

export default apolloClient;
