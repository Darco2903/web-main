<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useStore as useUserStore } from "@store/user";
import { STATUS_SERVER_ORIGIN } from "@mod/config";

import ThemeSwitcher from "@comp/UpperPanel/ThemeSwitcher.vue";
import UserAccount from "@comp/UpperPanel/Account/Index.vue";

// as an <img>: inline, its gradient id would clash with the one in icon-cdn.svg
import mainIconUrl from "@assets/icon-main.svg?url";

const userStore = useUserStore();
</script>

<template>
  <header id="upper-panel" class="g-navbar g-glass">
    <div class="flex row align-center" style="gap: 24px">
      <RouterLink to="/" class="logo" aria-label="Home">
        <img :src="mainIconUrl" alt="" />
      </RouterLink>

      <nav class="flex row" style="gap: 4px">
        <a
          :href="STATUS_SERVER_ORIGIN"
          class="g-btn g-btn-ghost g-btn-sm"
          v-show="userStore.isAdmin() || true"
          target="_blank"
          rel="noopener noreferrer"
          >Status</a
        >
      </nav>
    </div>

    <div class="upper-panel-right">
      <ThemeSwitcher />
      <UserAccount />
    </div>
  </header>
</template>

<style scoped>
#upper-panel {
  position: sticky;
  top: 16px;
  z-index: 100;
}

body[mobile] #upper-panel {
  top: 10px;
  padding: 10px 12px;
}

.logo {
  display: flex;
  border-radius: 50%;
  outline: none;
  transition:
    transform var(--g-duration),
    box-shadow var(--g-duration);

  img {
    width: 40px;
    height: 40px;
  }

  &:hover {
    transform: scale(1.06);
  }

  &:focus-visible {
    box-shadow: var(--g-ring);
  }
}

.upper-panel-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

body[mobile] .upper-panel-right {
  gap: 10px;
}
</style>
