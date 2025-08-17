<script>
import { IS_MOBILE } from "web-common";

import SiteIcon from "@comp/UpperPanel/SiteIcon.vue";
import UserAccount from "@comp/UpperPanel/Account/Index.vue";

import mainIcon from "@assets/icon-main.svg";
import cdnIcon from "@assets/icon-cdn.svg";

export default {
    name: "UpperPanel",

    components: {
        SiteIcon,
        UserAccount,
    },

    setup() {
        return {
            IS_MOBILE,
            mainIcon,
            cdnIcon,
            cdnOrigin: import.meta.env.VITE_CDN_SERVER_ORIGIN,
        };
    },

    data() {
        return {
            padding: IS_MOBILE ? "10px" : "20px 30px",
            siteIconSize: IS_MOBILE ? "64px" : "128px",
            upperPanelRowStyle: {
                flexDirection: IS_MOBILE ? "column-reverse" : "row",
                height: IS_MOBILE ? "auto" : "118px",
                gap: IS_MOBILE ? "20px" : "0",
            },
        };
    },
};
</script>

<template>
    <div id="upper-panel">
        <div class="upper-panel-row" id="panel-first-row" :style="upperPanelRowStyle">
            <div id="upper-panel-left">
                <SiteIcon :icon="mainIcon" :size="siteIconSize" internal="/" />
                <SiteIcon :icon="cdnIcon" :size="siteIconSize" :external="cdnOrigin" target="_blank" />
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
