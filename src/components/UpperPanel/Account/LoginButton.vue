<script>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { IS_MOBILE, wait } from "web-common";

import { origin } from "@config/auth-server.json";
import { gradient } from "@utils/index";

const ANGLE = 60;
const STEPS = 100;
const STEP_TIME = 10;

export default {
    name: "LoginButton",

    data() {
        return {
            hovering: false,
            iter: 0,
            loginHandlers: !IS_MOBILE
                ? {
                      mouseover: this.loginHover,
                      mouseleave: this.loginUnhover,
                  }
                : {
                      //   touchstart: loginHover,
                      //   touchend: loginUnhover,
                  },
        };
    },

    computed: {
        loginURL() {
            const url = new URL(origin + "/login");
            this.$route.path;
            url.searchParams.append("redirect", window.location.href);
            return url.href;
        },

        loginStyles() {
            return {
                "background-image": this.calcLoginGradient(this.iter),
            };
        },
    },

    methods: {
        calcLoginGradient(n) {
            const deg = (ANGLE * (n / 100) + 135).toFixed(1);
            return gradient(deg, "#00a6ff", "#c5007f");
        },

        async loginHover(e) {
            this.hovering = true;
            for (; this.iter < STEPS && this.hovering; this.iter++) {
                await wait(STEP_TIME);
            }
        },

        async loginUnhover(e) {
            this.hovering = false;
            for (; this.iter > 0 && !this.hovering; this.iter--) {
                await wait(STEP_TIME);
            }
        },
    },
};
</script>

<template>
    <a class="user-account-login" :href="loginURL" v-on="loginHandlers" :style="loginStyles">Se connecter</a>
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
    transition: filter v-bind(hoverTime) ease, animation v-bind(hoverTime) ease;
}

/* #user-account[session-active] #user-account-login {
    display: none;
} */
</style>
