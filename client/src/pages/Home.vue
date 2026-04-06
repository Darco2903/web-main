<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { IS_MOBILE } from "@darco2903/web-common";
import { VITE_CDN_SERVER_ORIGIN, VITE_MANAGER_SERVER_ORIGIN } from "@mod/config";

import SiteIcon from "@comp/SiteIcon.vue";

import CdnIcon from "@assets/icon-cdn.svg";
import ManagerIcon from "@assets/icon-manager.svg";

const { t } = useI18n();

const siteIconSize = IS_MOBILE ? "128px" : "192px";
</script>

<template>
    <div id="home-content">
        <div class="flex center" :class="IS_MOBILE ? 'col' : 'row'" style="margin: 40px; gap: 40px">
            <!-- <span
                :style="{
                    color: '#bbbb',
                    fontWeight: 'bold',
                    fontSize: '1.6em',
                    textAlign: 'center',
                    width: '100%',
                    marginTop: '10px',
                    pointerEvents: 'none',
                }"
                >{{ t("home.welcomeMessage") }}</span
            > -->

            <div class="flex row center redirect-elem">
                <SiteIcon
                    style="position: relative"
                    :size="siteIconSize"
                    :url="`${VITE_CDN_SERVER_ORIGIN}/app/`"
                    :clickable="true"
                    :external="true"
                    target="_blank"
                >
                    <CdnIcon style="position: absolute; width: 100%; height: 100%" />
                    <span class="redirect-elem-label">CDN</span>
                </SiteIcon>
            </div>

            <div class="flex row center redirect-elem">
                <SiteIcon
                    style="position: relative"
                    :size="siteIconSize"
                    :url="VITE_MANAGER_SERVER_ORIGIN"
                    :clickable="true"
                    :external="true"
                    target="_blank"
                >
                    <ManagerIcon style="position: absolute; width: 100%; height: 100%" />
                    <span class="redirect-elem-label">Server Manager</span>
                </SiteIcon>
            </div>
        </div>
    </div>
</template>

<style scoped>
.redirect-elem {
    border-radius: 10px;
    padding: 20px;
    border: 2px solid transparent;
    user-select: none;
    background-color: var(--bg-card);
    transition:
        border 2000ms ease,
        box-shadow 100ms ease;

    &:hover {
        border: 2px solid var(--input);
        box-shadow: 5px 5px 30px -15px var(--input);
    }

    .redirect-elem-label {
        position: absolute;
        bottom: 0;
        transform: translateY(25%);

        width: 100%;
        color: var(--text);
        font-weight: bold;
        font-size: 1.2em;
        text-align: center;
    }
}
</style>
