<script>
import AuthAPI from "auth-api";
import { RouterLink } from "vue-router";
import { getCookie, wait } from "web-common";

import UserIcon from "@comp/UserIcon.vue";
import LoginButton from "@comp/UpperPanel/Account/LoginButton.vue";

import userIconDark from "@icons/profile/user-default-dark.jpg";

import { origin } from "@config/auth-server.json";

const SESSION_ANIM_UPDATE_TIME = 100;
const HIVER_TIME = "0.1s";

export default {
    name: "UserAccount",

    components: {
        UserIcon,
        LoginButton,
        RouterLink,
    },

    data() {
        return {
            ready: false,
            noSession: true,
            userIcon: userIconDark,
            border: false,
            deg: 135,
            sessionInterval: null,

            userId: getCookie("user_id"),
            /** @type {import("vue").Ref<import("auth-api").Types.User>} */
            user: {},
            userBoxImageContainerStyle: {},
        };
    },

    computed: {
        sessionStyles() {
            return {
                background: `linear-gradient(${this.deg}deg, #00a6ff, #c5007f)`,
            };
        },

        logoutURL() {
            const url = new URL(origin + "/logout");
            url.searchParams.append("redirect", window.location.origin);
            return url.href;
        },
    },

    methods: {
        loadSessionDeg() {
            const sessionDeg = parseInt(window.localStorage.getItem("session-deg"));
            if (sessionDeg) {
                this.deg = sessionDeg;
            }
        },

        saveSessionDeg() {
            window.localStorage.setItem("session-deg", this.deg);
        },

        startSession() {
            this.sessionInterval = setInterval(() => {
                this.deg += 1;
                if (this.deg >= 360) {
                    this.deg = 0;
                }
            }, SESSION_ANIM_UPDATE_TIME);
        },

        stopSession() {
            clearInterval(this.sessionInterval);
        },

        async init() {
            if (this.userId) {
                const p1 = AuthAPI.user.getFromId(this.userId).then((res) => {
                    if (res.error) {
                        console.error(res.error);
                        return;
                    }
                    if (!res.result) {
                        console.error("No user found");
                        return;
                    }
                    this.noSession = false;
                    this.user = res.user;
                    this.border = this.user.round_border;
                    this.userBoxImageContainerStyle["border-radius"] = this.user.round_border ? "50%" : "0%";
                });

                const p2 = AuthAPI.user.picture.profile
                    .get(this.userId)
                    .then((blob) => {
                        if (blob.size !== 0) {
                            this.userIcon = URL.createObjectURL(blob);
                        } else {
                            this.userIcon = userIconDark;
                        }
                    })
                    .catch((err) => {
                        console.error("Unable to load profile picture", err);
                    });

                await Promise.allSettled([p1, p2]);
                console.log("noSession", this.noSession);
                console.log("User loaded");
            }
            this.ready = true;
        },

        async onStorage(e) {
            if (!e.key) {
                return;
            }

            // console.log("storage", e.key, e.newValue, e.oldValue);

            if (e.key === "reloadUser") {
                if (this.ready) {
                    await this.init();
                    console.log("User reloaded");
                }
            }
        },
    },

    async mounted() {
        console.log("UserAccount mounted");

        await this.init();

        this.loadSessionDeg();
        this.startSession();

        window.addEventListener("beforeunload", this.saveSessionDeg);
        window.addEventListener("storage", this.onStorage);
    },

    unmounted() {
        console.log("UserAccount unmounted");

        window.removeEventListener("beforeunload", this.saveSessionDeg);
        window.removeEventListener("storage", this.onStorage);

        this.stopSession();
        this.saveSessionDeg();
    },
};
</script>

<template>
    <div id="user-account" v-show="ready">
        <LoginButton v-if="noSession" />

        <div id="user-session" v-else :style="sessionStyles">
            <div id="user-session-container">
                <div id="user-account-info">
                    <!-- <div id="user-account-icon-container">
                        <img id="user-account-icon" />
                    </div> -->

                    <UserIcon :userIcon="userIcon" :roundBorder="border" size="48px" border-size="3px" />

                    <label id="user-account-name">{{ user.name }}</label>
                </div>

                <div id="user-links">
                    <RouterLink to="/profile/me">Mon Profil</RouterLink>
                    <a id="user-account-logout" :href="logoutURL">Déconnexion</a>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#user-account {
}

#user-account a {
    text-decoration: none;
}

#user-session {
    display: flex;
    flex-direction: column;
    /* background: var(--user-gradient-anim); */
    padding: 5px;
    border-radius: 18px;
    /* animation: user-gradient 60s infinite ease-in-out; */
}

/* #user-session[loading],
#user-session[loading] * {
    opacity: 0;
    animation: none;
    transition: none;
} */

#user-session-container {
    border-radius: 14px;
    overflow: hidden;
    /* background-color: #fff; */
    /* background-color: var(--background-color-light); */
    background-color: var(--background-color);
    transition: background-color var(--theme-time) ease;
}

#user-account-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 10px;
}

#user-account-my-account {
}

#user-account-name {
    /* max-width: 120px; */
    width: 120px;
    font-size: 14px;
    font-weight: bold;
    text-overflow: ellipsis;
    overflow: hidden;
    /* text-align: center; */
    color: var(--text-color);
    transition: color var(--theme-time) ease;
}

body[mobile] #user-account-name {
    /* display: none; */
    /* width: 60px; */
    /* font-size: 10px; */
}

#user-account-icon:not([src]) {
    display: none;
}

#user-links {
    display: flex;
    flex-direction: row;
}

body[mobile] #user-session:not([active]) #user-links {
    /* display: none; */
}

#user-links a {
    --border-color: #222;
    --side-padding: 10px;
    width: 100px;
    text-align: center;
    padding: 10px 5px;
    border-top: 2px solid var(--border-color);
    position: relative;
    cursor: pointer;
    color: var(--text-color);
    transition: color var(--theme-time) ease, background-color var(--theme-time) ease;
}

#user-links a:not(:last-child) {
    border-right: 2px solid var(--border-color);
}

#user-links a:first-child {
    padding-left: var(--side-padding);
}

#user-links a:last-child {
    padding-right: var(--side-padding);
}

#user-links a:hover {
    background-color: #5552;
}

body[mobile] #user-links a {
    /* width: 80px; */
    /* padding: 5px 2px; */
    /* font-size: 10px; */
}

#user-account-my-account {
}

#user-account-logout {
}
</style>
