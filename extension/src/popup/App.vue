<template>
    <div id="app">
        <group></group>
    </div>
</template>

<script>
import Group from "./components/Group.vue";

export default {
    name: "App",
    components: { Group },
};
</script>

<style lang="scss">
#app {
    color: red;
}
</style>
