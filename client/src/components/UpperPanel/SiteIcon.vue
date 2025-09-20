<script setup lang="ts">
import { RouterLink } from "vue-router";

const { icon, internal, external, size, target } = defineProps({
    icon: {
        type: String,
        required: true,
    },
    internal: {
        type: String,
        default: "",
    },
    external: {
        type: String,
        default: "",
    },
    size: {
        type: String,
        default: "64px",
    },
    target: {
        type: String,
        default: "_self",
    },
});
</script>

<template>
    <div class="site-icon">
        <a class="site-icon-redirect" :href="external" :target="target" v-if="external">
            <img class="site-icon-img" :src="icon" alt="Site icon" />
        </a>
        <RouterLink :to="internal" v-if="internal">
            <img class="site-icon-img" :src="icon" alt="Site icon" />
        </RouterLink>
    </div>
</template>

<style scoped>
.site-icon {
    position: relative;
    width: v-bind(size);
    height: v-bind(size);
    max-width: 64px;
    max-height: 64px;
    /* overflow: hidden; */
    background-size: contain;
    background-repeat: no-repeat;
    transition: filter var(--hover-time) ease, background-image var(--theme-time) ease;
}

body[mobile] .site-icon {
    /* width: 32px; */
    /* height: 32px; */
}

.site-icon:hover {
    filter: drop-shadow(2px 2px 5px var(--hover-color-light)) brightness(1.01);
}

body[theme="dark"] .site-icon:hover {
    filter: drop-shadow(2px 2px 5px var(--hover-color-dark)) brightness(1.01);
}

.site-icon a {
    position: absolute;
    width: 100%;
    height: 100%;
}

.site-icon-img {
    width: 100%;
    height: 100%;
}
</style>
