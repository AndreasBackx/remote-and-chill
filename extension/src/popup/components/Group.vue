<template>
    <div id="group">
        <input placeholder="Username" type="text" name="user_name" id="user_name" v-model="createUserName">
        <input placeholder="Group name" type="text" name="group_name" id="group_name" v-model="createGroupName">
        <button
            @click="createGroup"
        >Create group</button>

        <hr>
        <input placeholder="Group ID" type="text" name="group_id" id="group_id" v-model="joinGroupId">
        <button>Join group</button>

        <hr>
        {{ me }}
    </div>
</template>

<script>
import gql from "graphql-tag";

export default {
    name: "Group",
    created: function() {
        fetch("http://localhost:3000")
            .then(function(response) {
                console.log(response);
            })
            .catch(error => console.error(error));
    },
    data: function() {
        return {
            createUserName: "Andreas",
            createGroupName: "Group",
            joinGroupId: "",
            me: {},
        };
    },
    watch: {
        joinGroupId: function(newValue, oldValue) {
            console.log("newValue", newValue);
            console.log("oldValue", oldValue);
        },
    },
    methods: {
        createGroup: function(event) {
            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation($name: String!, $userName: String!) {
                            createGroup(name: $name, userName: $userName) {
                                user {
                                    id
                                    secret
                                    name
                                    expiresAt
                                    group {
                                        name
                                    }
                                }
                                group {
                                    id
                                    name
                                    owner {
                                        name
                                    }
                                    members {
                                        name
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        name: this.createGroupName,
                        userName: this.createUserName,
                    },
                })
                .then(data => console.log(data))
                .catch(error => console.error(error));
        },
    },
};
</script>

<style lang="scss">
#group {
}
</style>
