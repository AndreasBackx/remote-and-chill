<template>
    <div id="group">
        <template v-if="group">
            <section class="header">
                <h1>{{ group.name }}</h1>
                <h2>Watching Netflix</h2>
            </section>
            <section class="members">
                <h1>Members</h1>

                <h2 v-for="member in group.members"
                :key="member.id"
                :class="{ bold: me.id === member.id }">
                    {{ member.name }}
                </h2>
            </section>
            <section>
                <button @click="copyGroupId">{{ copyMessage }}</button>
                <button class="flat" @click="deleteGroup">Delete group</button>
                <button class="flat" @click="leaveGroup">Leave group</button>
            </section>

        </template>
        <template v-else>
            <section id="user-name">
                <input placeholder="Your Name" type="text" v-model.lazy="createUserName">
            </section>
            <section id="group-creation">
                <input placeholder="Group Name" type="text" v-model.lazy="createGroupName">
                <button @click="createGroup">Create group</button>
                <span class="caption">or</span>
                <input placeholder="Group Code" type="text" v-model="joinGroupId">
                <button @click="joinGroup">Join group</button>
            </section>

            <pre v-if="error">
                <code>
                    {{ error }}
                </code>
            </pre>
        </template>
    </div>
</template>

<script>
import createGroup from "../../shared/graphql/mutations/createGroup.graphql";
import deleteGroup from "../../shared/graphql/mutations/deleteGroup.graphql";
import joinGroup from "../../shared/graphql/mutations/joinGroup.graphql";
import leaveGroup from "../../shared/graphql/mutations/leaveGroup.graphql";

const defaultData = {
    createUserName: "",
    createGroupName: "",
    joinGroupId: "",
    copyMessage: "Copy group id",
    me: null,
    group: null,
    me: null,
    error: null,
};

export default {
    name: "Group",
    created: function() {
        browser.storage.local.get().then(data => {
            const storedData = [
                "group",
                "me",
                "createUserName",
                "createGroupName",
            ];

            for (const name of storedData) {
                if (data[name]) {
                    this[name] = data[name];
                }
            }
        });
        browser.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === "local") {
                for (var key in changes) {
                    const change = changes[key];
                    this[key] = change.newValue;
                }
            }
        });
    },
    data: function() {
        return JSON.parse(JSON.stringify(defaultData));
    },
    watch: {
        createUserName: function(newValue, oldValue) {
            browser.storage.local.set({
                createUserName: newValue,
            });
        },
        createGroupName: function(newValue, oldValue) {
            browser.storage.local.set({
                createGroupName: newValue,
            });
        },
    },
    methods: {
        createGroup: function(event) {
            this.$apollo
                .mutate({
                    mutation: createGroup,
                    variables: {
                        name: this.createGroupName,
                        userName: this.createUserName,
                    },
                })
                .then(result => this.assignGroup(result))
                .catch(error => this.handleError(error));
        },
        assignGroup: function(result) {
            const groupResponse = result.data.createGroup;
            browser.storage.local.set({
                group: groupResponse.group,
                me: groupResponse.user,
            });
        },
        handleError: function(error) {
            console.error(error);
            this.error = error;
        },
        joinGroup: function(event) {
            this.$apollo
                .mutate({
                    mutation: joinGroup,
                    variables: {
                        name: this.joinGroupId,
                        userName: this.createUserName,
                    },
                })
                .then(result => this.assignGroup(result))
                .catch(error => this.handleError(error));
        },
        copyGroupId: function(event) {
            // Clipboard.writeText(this.group.id);
            navigator.clipboard
                .writeText(this.group.id)
                .then(() => {
                    console.log("Text copied to clipboard");
                })
                .catch(err => {
                    // This can happen if the user denies clipboard permissions:
                    console.error("Could not copy text: ", err);
                });
            this.copyMessage = "Copied";
            const self = this;
            setTimeout(function() {
                console.log(defaultData.copyMessage);
                self.copyMessage = defaultData.copyMessage;
            }, 2000);
        },
        deleteGroup: function(event) {
            this.$apollo
                .mutate({
                    mutation: deleteGroup,
                })
                .then(result => this.unassignGroup())
                .catch(error => this.unassignGroup());
        },
        leaveGroup: function(event) {
            this.$apollo
                .mutate({
                    mutation: leaveGroup,
                })
                .then(result => this.unassignGroup())
                .catch(error => this.unassignGroup());
        },
        unassignGroup: function() {
            browser.storage.local.set({
                group: null,
                me: null,
            });
        },
    },
};
</script>

<style lang="scss">
$highEmphasis: rgba(0, 0, 0, 0.87);
$mediumEmphasis: rgba(0, 0, 0, 0.6);
$disabled: rgba(0, 0, 0, 0.38);
$purple: rgb(48, 39, 79);
$lightPurple: rgba(48, 39, 79, 0.6);

$background: #f5f5f5;
$divider: rgba(0, 0, 0, 0.12);

body {
    background: $background;
    font-family: Roboto, sans-serif;
}

input,
button {
    height: 40px;
    box-sizing: border-box;
    padding-left: 8px;
    padding-right: 8px;
    background: white;
    border-radius: 2px;
    color: $highEmphasis;
    display: block;
    width: 100%;
    border: 0;
    font-size: 10pt;

    &:focus {
        outline: none;
        border: 1px solid $lightPurple;
    }

    &.flat {
        color: $purple;
        background: none;
    }
}

button {
    background: $purple;
    color: white;
    text-transform: uppercase;

    &:hover {
        cursor: pointer;
    }
}

section {
    padding: 16px;
}

.caption {
    color: $lightPurple;
    padding: 4px 0;
    display: block;
    width: 100%;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 12px;
}

.header {
}

h1,
h2 {
    text-align: center;
    text-transform: uppercase;
    font-weight: 400;
    margin: 0;

    &.bold {
        font-weight: bold;
    }
}

h1 {
    font-size: 20pt;
    color: $purple;
    margin-bottom: 4px;
}

h2 {
    font-size: 16pt;
    color: $lightPurple;
}

#group {
    width: 240px;

    input,
    button {
        margin-bottom: 12px;
    }

    #user-name {
        border-bottom: 1px solid $divider;
    }

    #group-creation {
    }
}
</style>
