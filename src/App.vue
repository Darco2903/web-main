<script>
import { RouterView } from "vue-router";

import UpperPanel from "@comp/UpperPanel/Index.vue";

export default {
    components: {
        UpperPanel,
        RouterView,
    },

    data() {
        return {
            upperPanel: true,
        };
    },
};
</script>

<template>
    <UpperPanel v-if="upperPanel" />

    <RouterView :upperPanel @toggleUpperPanel="(value) => (upperPanel = value)" />
</template>

<style scoped></style>
