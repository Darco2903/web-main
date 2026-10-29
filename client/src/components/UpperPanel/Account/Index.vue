<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import { useStore as useUserStore } from "@store/user";
import { useI18n } from "vue-i18n";
import { AUTH_SERVER_ORIGIN } from "@mod/config";

import UserIcon from "@comp/UserIcon.vue";
import LoginButton from "@comp/UpperPanel/Account/LoginButton.vue";

/** One turn of the avatar ring (1deg every 100ms) */
const RING_TURN_TIME = 36_000; // in ms
const RING_DEFAULT_DEG = 135;

const userStore = useUserStore();
const { t } = useI18n();

const noSession = computed<boolean>(() => !userStore.info);

// the avatar ring slowly rotates, its angle is kept across page loads. The rotation is a CSS
// animation of --ring-angle (see the style), so it doesn't re-render the component every frame.
const ringGradient = "linear-gradient(var(--ring-angle), #00a6ff, #c5007f)";
const ringStartDeg = loadRingDeg();
const ringStartTime = performance.now();
// a negative delay starts the animation where the last page left it
const ringDelay = `${(-ringStartDeg / 360) * RING_TURN_TIME}ms`;
const ringDuration = `${RING_TURN_TIME}ms`;

const logoutURL = computed(() => {
  const url = new URL(AUTH_SERVER_ORIGIN + "/logout");
  url.searchParams.append("redirect", window.location.origin);
  return url.href;
});

function loadRingDeg(): number {
  const deg = parseFloat(window.localStorage.getItem("session-deg") ?? "");
  return Number.isFinite(deg) ? ((deg % 360) + 360) % 360 : RING_DEFAULT_DEG;
}

function saveRingDeg() {
  const elapsed = performance.now() - ringStartTime;
  const deg = (ringStartDeg + (elapsed / RING_TURN_TIME) * 360) % 360;
  window.localStorage.setItem("session-deg", Math.round(deg).toString());
}

onMounted(() => {
  console.log("UserAccount mounted");

  window.addEventListener("beforeunload", saveRingDeg);
});

onUnmounted(() => {
  console.log("UserAccount unmounted");

  window.removeEventListener("beforeunload", saveRingDeg);

  saveRingDeg();
});
</script>

<template>
  <div id="user-account">
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
/* registered so the angle is interpolated, an unregistered property would jump from 0 to 360deg */
@property --ring-angle {
  syntax: "<angle>";
  inherits: true;
  initial-value: 135deg;
}

@keyframes ring-rotate {
  from {
    --ring-angle: 0deg;
  }
  to {
    --ring-angle: 360deg;
  }
}

#user-session {
  animation: ring-rotate v-bind(ringDuration) linear infinite;
  animation-delay: v-bind(ringDelay);

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
