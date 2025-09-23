<script setup lang="ts">
import { RouterLink } from "vue-router";

const { icon, size, url, external, target } = defineProps({
    icon: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: false,
        default: "64px",
    },
    url: {
        type: String,
        required: true,
    },
    external: {
        type: Boolean,
        required: false,
        default: false,
    },
    target: {
        type: String,
        required: false,
        default: "_self",
    },
});
</script>

<template>
    <div class="site-icon">
        <a class="site-icon-redirect" :href="url" :target="target" v-if="external">
            <img class="site-icon-img" :src="icon" alt="Site icon" />
        </a>
        <RouterLink :to="url" v-else>
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

.site-icon::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    /* background: linear-gradient(135deg, #eeeeee02, #ffffff18); */
    z-index: 1;
}

.site-icon::after {
    content: "";
    position: absolute;
    transform: scale(1.01);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    /* background: linear-gradient(135deg, #fffc, #fff2, #fffc); */
    /* background: linear-gradient(135deg, #b19fd3dd, #fff2, #b19fd3dd); */
    z-index: -1;
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
