<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { IS_MOBILE } from "@darco2903/web-common";
import { CDN_SERVER_ORIGIN, MANAGER_SERVER_ORIGIN, ALTV_SERVER_ORIGIN } from "@mod/config";

import AltvIcon from "@assets/icon-altv.svg";
import CdnIcon from "@assets/icon-cdn.svg";
import ManagerIcon from "@assets/icon-manager.svg";

const { t } = useI18n();

const siteIconSize = IS_MOBILE ? "112px" : "160px";

const sites = [
  { label: "CDN", url: `${CDN_SERVER_ORIGIN}/app/`, icon: CdnIcon },
  { label: "Server Manager", url: MANAGER_SERVER_ORIGIN, icon: ManagerIcon },
  { label: "AltV Web", url: ALTV_SERVER_ORIGIN, icon: AltvIcon },
];
</script>

<template>
  <div id="home-content">
    <!-- <span class="g-text-muted">{{ t("home.welcomeMessage") }}</span> -->

    <div class="sites">
      <a
        v-for="site in sites"
        :key="site.label"
        class="site g-glass g-card g-card-hover"
        :href="site.url"
        target="_blank"
      >
        <component :is="site.icon" class="site-icon" />
        <span class="site-label">{{ site.label }}</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.sites {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
  margin-top: 40px;
}

body[mobile] .sites {
  gap: 16px;
  margin-top: 16px;
}

.site {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 200px;
  color: var(--g-text);
  text-decoration: none;
  user-select: none;
  outline: none;

  &:focus-visible {
    box-shadow: var(--g-highlight), var(--g-ring);
  }
}

body[mobile] .site {
  min-width: 140px;
  padding: 16px;
}

.site-icon {
  width: v-bind(siteIconSize);
  height: v-bind(siteIconSize);
}

.site-label {
  font-size: 1.1em;
  font-weight: 700;
}
</style>
