<script setup lang="ts">
import { computed, ref, type ComputedRef } from "vue";
import { IS_MOBILE, wait } from "web-common";
import { gradient } from "@utils/index";

const ANGLE = 60;
const STEPS = 100;
const STEP_TIME = 10;

let hovering = false;
const iter = ref(0);
// const loginHandlers = IS_MOBILE
//     ? {
//           //   touchstart: loginHover,
//           //   touchend: loginUnhover,
//       }
//     : {
//           mouseover: loginHover,
//           mouseleave: loginUnhover,
//       };

const loginURL: ComputedRef<string> = computed(() => {
    const url = new URL(import.meta.env.VITE_AUTH_SERVER_ORIGIN + "/login");
    url.searchParams.append("redirect", window.location.href);
    return url.href;
});

const loginStyles = computed(() => {
    return {
        "background-image": calcLoginGradient(iter.value),
    };
});

function calcLoginGradient(n: number): string {
    const deg: number = ANGLE * (n / 100) + 135;
    return gradient(deg, "#00a6ff", "#c5007f");
}

async function loginHover(e: MouseEvent) {
    // console.log("hover");
    hovering = true;
    for (; iter.value < STEPS && hovering; iter.value++) {
        await wait(STEP_TIME);
    }
}

async function loginUnhover(e: MouseEvent) {
    // console.log("unhover");
    hovering = false;
    for (; iter.value > 0 && !hovering; iter.value--) {
        await wait(STEP_TIME);
    }
}
</script>

<template>
    <a class="user-account-login" :href="loginURL" @mouseover="loginHover" @mouseleave="loginUnhover" :style="loginStyles">Se connecter</a>
</template>

<style scoped>
.user-account-login {
    border-radius: 5px;
    padding: 10px;
    font-size: 12px;
    cursor: pointer;
    user-select: none;
    color: #fff;
    /* background-image: v-bind(bluePinkGradient); */
    text-decoration: none;
    /* transition: filter v-bind(hoverTime) ease, animation v-bind(hoverTime) ease; */
}

/* #user-account[session-active] #user-account-login {
    display: none;
} */
</style>
