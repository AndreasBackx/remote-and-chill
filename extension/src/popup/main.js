import VueApollo from "vue-apollo";
import Vue from "vue/dist/vue.js";
import apolloClient from "../shared/apollo";
import me from "../shared/graphql/queries/me.graphql";
import App from "./App.vue";

Vue.use(VueApollo);

const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
});

new Vue({
    el: "#app",
    provide: apolloProvider.provide(),
    render: h => h(App),
    apollo: {
        me: me,
    },
});
