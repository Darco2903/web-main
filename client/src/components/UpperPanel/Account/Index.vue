<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type CSSProperties, type Ref } from "vue";
import { RouterLink } from "vue-router";
import { store } from "@store/store";

import UserIcon from "@comp/UserIcon.vue";
import LoginButton from "@comp/UpperPanel/Account/LoginButton.vue";

import userIconDark from "@icons/profile/user-default-dark.jpg";
import { loadUser } from "@/main";

const SESSION_ANIM_UPDATE_TIME = 100;

let sessionInterval: ReturnType<typeof setInterval> | null = null;

const ready = ref(false);
const noSession = ref(true);
const userIcon: Ref<string | null> = ref(null);
const deg = ref(135);
const userBoxImageContainerStyle: Ref<CSSProperties> = ref({});

const border = computed(() => {
    return store.state.user?.round_border || false;
});

const sessionStyles = computed(() => {
    return {
        background: `linear-gradient(${deg.value}deg, #00a6ff, #c5007f)`,
    };
});

const logoutURL = computed(() => {
    const url = new URL(import.meta.env.VITE_AUTH_SERVER_ORIGIN + "/logout");
    url.searchParams.append("redirect", window.location.origin);
    return url.href;
});

function loadSessionDeg() {
    const sessionDeg = window.localStorage.getItem("session-deg");
    if (sessionDeg) {
        deg.value = parseInt(sessionDeg);
    }
}

function saveSessionDeg() {
    window.localStorage.setItem("session-deg", deg.value.toString());
}

function startSession() {
    sessionInterval = setInterval(() => {
        deg.value += 1;
        if (deg.value >= 360) {
            deg.value = 0;
        }
    }, SESSION_ANIM_UPDATE_TIME);
}

function stopSession() {
    if (sessionInterval) {
        clearInterval(sessionInterval);
    }
}

async function init() {
    console.log("init user", store.state.user);
    if (store.state.user) {
        noSession.value = false;
        userBoxImageContainerStyle.value["border-radius"] = store.state.user.round_border ? "50%" : "0%";

        await loadUser();
        console.log("avatar", store.state.user.assets.avatar);
        const url = store.state.user.assets.avatar || userIconDark;
        userIcon.value = url + "?" + Date.now(); // Add cache-busting query parameter
        // userIcon.value = url;
        console.log("UserIcon:", userIcon.value);
        console.log("User loaded");
    }
    ready.value = true;
}

async function onStorage(e: StorageEvent) {
    if (!e.key) {
        return;
    }

    // console.log("storage", e.key, e.newValue, e.oldValue);

    if (e.key === "reloadUser") {
        if (ready.value) {
            await init();
            // console.log("User reloaded");
        }
    }
}

onMounted(async () => {
    // console.log("userId", user.value);

    console.log("UserAccount mounted");

    await init();

    loadSessionDeg();
    startSession();

    window.addEventListener("beforeunload", saveSessionDeg);
    window.addEventListener("storage", onStorage);
});

onUnmounted(async () => {
    console.log("UserAccount unmounted");

    window.removeEventListener("beforeunload", saveSessionDeg);
    window.removeEventListener("storage", onStorage);

    stopSession();
    saveSessionDeg();
});
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

                    <UserIcon :userIcon :roundBorder="border" size="48px" border-size="3px" />

                    <label id="user-account-name">{{ store.state.user?.name || "Unknown" }}</label>
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
