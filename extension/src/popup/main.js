import ApolloClient from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";
import VueApollo from "vue-apollo";
import Vue from "vue/dist/vue.js";
import App from "./App.vue";

const httpLink = new HttpLink({
    uri: "http://localhost:3000",
});

// https://www.apollographql.com/docs/react/recipes/authentication.html
// const authLink = setContext((_, { headers }) => {
//     // get the authentication token from local storage if it exists
//     const token = localStorage.getItem("token");
//     // return the headers to the context so httpLink can read them
//     return {
//         headers: {
//             ...headers,
//             authorization: token ? `Bearer ${token}` : "",
//         },
//     };
// });

const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    // connectToDevTools: true,
});

Vue.use(VueApollo);

const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
});

new Vue({
    el: "#app",
    provide: apolloProvider.provide(),
    render: h => h(App),
    apollo: {
        me: gql`
            {
                me {
                    name
                }
            }
        `,
    },
});
