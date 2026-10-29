<script setup lang="ts">
import { computed, ref } from "vue";
import { IS_MOBILE, wait } from "@darco2903/web-common";
import { gradient } from "@utils/gradient";
import { useI18n } from "vue-i18n";
import { AUTH_SERVER_ORIGIN } from "@mod/config";

const ANGLE = 60;
const STEPS = 100;
const STEP_TIME = 10;
// const HOVER_TIME = 0;

const { t } = useI18n();
const hovering = ref(false);
const iter = ref(0);
const loginHandlers = IS_MOBILE
  ? {
      touchstart: () => {},
      touchend: () => {},
    }
  : {
      mouseover: loginHover,
      mouseleave: loginUnhover,
    };
const loginURL = computed(() => {
  const url = new URL(AUTH_SERVER_ORIGIN + "/login");
  url.searchParams.append("redirect", window.location.href);
  return url.href;
});

const loginStyles = computed(() => {
  return {
    "--btn-bg": calcLoginGradient(iter.value),
  };
});

function calcLoginGradient(n: number) {
  const deg = ANGLE * (n / 100) + 135;
  return gradient(deg, "#00a6ff", "#c5007f");
}

async function loginHover(e: MouseEvent) {
  hovering.value = true;
  for (; iter.value < STEPS && hovering.value; iter.value++) {
    await wait(STEP_TIME);
  }
}

async function loginUnhover(e: MouseEvent) {
  hovering.value = false;
  for (; iter.value > 0 && !hovering.value; iter.value--) {
    await wait(STEP_TIME);
  }
}
</script>

<template>
  <!-- --btn-bg replaces the static gradient of g-btn-brand to rotate it on hover, the hover tint stays on top -->
  <a class="user-account-login g-btn g-btn-brand" :href="loginURL" v-on="loginHandlers" :style="loginStyles">{{
    t("loginButton.login")
  }}</a>
</template>

<style scoped>
.user-account-login {
  min-width: 50px;
}
</style>
