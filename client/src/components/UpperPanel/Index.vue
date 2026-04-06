<script setup lang="ts">
import type { CSSProperties } from "vue";
import { IS_MOBILE } from "@darco2903/web-common";
import { VITE_CDN_SERVER_ORIGIN } from "@mod/config";

import SiteIcon from "@comp/SiteIcon.vue";
import UserAccount from "@comp/UpperPanel/Account/Index.vue";

import MainIcon from "@assets/icon-main.svg";
import CdnIcon from "@assets/icon-cdn.svg";

const padding = IS_MOBILE ? "10px" : "20px 30px";
const siteIconSize = IS_MOBILE ? "64px" : "128px";
const upperPanelRowStyle: CSSProperties = {
    flexDirection: IS_MOBILE ? "column-reverse" : "row",
    height: IS_MOBILE ? "auto" : "118px",
    gap: IS_MOBILE ? "20px" : "0",
};
</script>

<template>
    <div id="upper-panel">
        <div class="upper-panel-row" id="panel-first-row" :style="upperPanelRowStyle">
            <div id="upper-panel-left">
                <!-- <SiteIcon :size="siteIconSize" url="/" :clickable="true">
                    <MainIcon />
                </SiteIcon>

                <SiteIcon :size="siteIconSize" :url="`${VITE_CDN_SERVER_ORIGIN}/app/`" :clickable="true" :external="true" target="_blank">
                    <CdnIcon />
                </SiteIcon> -->
            </div>

            <div id="upper-panel-right">
                <UserAccount />
            </div>
        </div>
    </div>
</template>

<style scoped>
#upper-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 5px 5px 30px -15px #000;
    /* padding: 20px 30px; */
    padding: v-bind(padding);
    border-radius: 10px;
}

.upper-panel-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 118px;
}

.upper-panel-row:first-of-type {
    justify-content: space-between;
}

.upper-panel-row:has(nav) {
    justify-content: center;
}

#upper-panel-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 48px;
}

#upper-panel-right {
    display: flex;
    align-items: center;
    gap: 3vw;
}
</style>
