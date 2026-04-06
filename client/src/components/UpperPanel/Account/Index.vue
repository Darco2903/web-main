<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type CSSProperties, type Ref } from "vue";
import { RouterLink } from "vue-router";
import { useStore as useUserStore } from "@store/user";
import { useI18n } from "vue-i18n";
import { VITE_AUTH_SERVER_ORIGIN } from "@mod/config";

import UserIcon from "@comp/UserIcon.vue";
import LoginButton from "@comp/UpperPanel/Account/LoginButton.vue";

import userIconDark from "@icons/profile/user-default-dark.jpg";

const SESSION_ANIM_UPDATE_TIME = 100;

let sessionInterval: ReturnType<typeof setInterval> | null = null;

const userStore = useUserStore();
const { t } = useI18n();
const ready = ref(false);
const noSession = ref(true);
const userIcon: Ref<string | undefined> = ref(undefined);
const deg = ref(135);
const userBoxImageContainerStyle: Ref<CSSProperties> = ref({});

const border = computed(() => {
    return userStore.info?.round_border || false;
});

const sessionStyles = computed(() => {
    return {
        background: `linear-gradient(${deg.value}deg, #00a6ff, #c5007f)`,
    };
});

const logoutURL = computed(() => {
    const url = new URL(VITE_AUTH_SERVER_ORIGIN + "/logout");
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
    console.log("init user", userStore.info);
    if (userStore.info) {
        noSession.value = false;
        userBoxImageContainerStyle.value["border-radius"] = userStore.info.round_border ? "50%" : "0%";

        console.log("avatar", userStore.getUserIconUrl());
        const url = userStore.getUserIconUrl() || userIconDark;
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

                    <UserIcon :iconUrl="userIcon" :roundBorder="border" size="48px" border-size="3px" />

                    <label id="user-account-name">{{ userStore.info?.name || "Unknown" }}</label>
                </div>

                <div id="user-links">
                    <RouterLink to="/profile/me">{{ t("accountIndex.myProfile") }}</RouterLink>
                    <a id="user-account-logout" :href="logoutURL">{{ t("accountIndex.logout") }}</a>
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
    background-color: var(--bg);
    transition: background-color 200ms ease;
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
    color: var(--text);
    transition: color 200ms ease;
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
    color: var(--text);
    transition:
        color 200ms ease,
        background-color 200ms ease;
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
