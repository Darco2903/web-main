<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useStore as useUserStore } from "@store/user";
import { useI18n } from "vue-i18n";
import { AUTH_SERVER_ORIGIN } from "@mod/config";

import UserIcon from "@comp/UserIcon.vue";
import LoginButton from "@comp/UpperPanel/Account/LoginButton.vue";

const SESSION_ANIM_UPDATE_TIME = 100;

let sessionInterval: ReturnType<typeof setInterval> | null = null;

const userStore = useUserStore();
const { t } = useI18n();

const ready = ref<boolean>(false);
const noSession = ref<boolean>(true);
const deg = ref<number>(135);

// the avatar ring slowly rotates, its angle is kept across page loads
const ringGradient = computed(() => `linear-gradient(${deg.value}deg, #00a6ff, #c5007f)`);

const logoutURL = computed(() => {
  const url = new URL(AUTH_SERVER_ORIGIN + "/logout");
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

function init() {
  if (userStore.info) {
    noSession.value = false;
  }
}

onMounted(() => {
  console.log("UserAccount mounted");
  // console.log("userId", user.value);

  init();

  loadSessionDeg();
  startSession();

  window.addEventListener("beforeunload", saveSessionDeg);

  ready.value = true;
});

onUnmounted(() => {
  console.log("UserAccount unmounted");

  window.removeEventListener("beforeunload", saveSessionDeg);

  stopSession();
  saveSessionDeg();
});
</script>

<template>
  <div id="user-account" v-show="ready">
    <LoginButton v-if="noSession" />

    <div id="user-session" class="g-glass-subtle" :class="{ round: userStore.info?.round_border }" v-else>
      <RouterLink class="session-user" to="/profile/me" :title="t('accountIndex.myProfile')">
        <UserIcon
          :iconUrl="userStore.getUserIconUrlNoCache()"
          :roundBorder="userStore.info?.round_border"
          :ring="ringGradient"
          size="40px"
          border-size="3px"
        />

        <span class="session-name">{{ userStore.info?.name || "Unknown" }}</span>
      </RouterLink>

      <span class="session-separator"></span>

      <a class="g-btn g-btn-ghost g-btn-sm" :href="logoutURL">{{ t("accountIndex.logout") }}</a>
    </div>
  </div>
</template>

<style scoped>
#user-session {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px 4px;
  /* avatar corner (22% of 40px) + padding, so both corners follow the same curve */
  border-radius: 13px;
  transition: border-radius var(--g-duration);

  /* half the height (40px avatar + 2 * 4px padding): a pill radius like 999px would animate
     almost entirely in the first frames and look like a jump */
  &.round {
    border-radius: 24px;
  }
}

.session-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 6px;
  border-radius: inherit;
  color: var(--g-text);
  text-decoration: none;
  outline: none;

  &:hover .session-name {
    color: var(--color-primary);
  }

  &:focus-visible {
    box-shadow: var(--g-ring);
  }
}

.session-name {
  max-width: 140px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--g-duration);
}

.session-separator {
  width: 1px;
  height: 20px;
  background: var(--g-border-strong);
}

body[mobile] .session-name,
body[mobile] .session-separator {
  display: none;
}
</style>
