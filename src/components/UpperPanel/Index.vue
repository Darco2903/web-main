<script>
import SiteIcon from "@comp/UpperPanel/SiteIcon.vue";
import UserAccount from "@comp/UpperPanel/Account/Index.vue";
// import ThemeSwitcher from "@comp/UpperPanel/ThemeSwitcher.vue";

import icon128 from "@assets/icon-128px.png";
import { IS_MOBILE } from "web-common";

export default {
    name: "UpperPanel",

    components: {
        SiteIcon,
        UserAccount,
        // ThemeSwitcher,
    },

    data() {
        return {
            icon128,

            padding: IS_MOBILE ? "10px" : "20px 30px",
        };
    },
};
</script>

<template>
    <div id="upper-panel">
        <div class="upper-panel-row" id="panel-first-row">
            <div id="upper-panel-left">
                <SiteIcon class="site-icon" :icon="icon128" size="128px" internal="/" />
            </div>

            <div id="upper-panel-right">
                <UserAccount />

                <!-- <ThemeSwitcher /> -->
            </div>
        </div>
    </div>
</template>

<style scoped>
/* body {
    background-color: var(--background-color-light);
    transition: background-color var(--theme-time) ease;
}

body[theme="dark"] {
    background-color: var(--background-color-dark);
}

*::selection {
    background-color: #66666644;
}

body[theme="dark"] *::selection {
    background-color: #cccccc44;
} */

#upper-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 5px 5px 30px -15px #000;
    /* padding: 20px 30px; */
    padding: v-bind(padding);
    border-radius: 10px;
}

body[mobile] #upper-panel {
    /* padding: 0; */
    /* margin: 5px 10px; */
}

.upper-panel-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 118px;
}

body[mobile] .upper-panel-row {
    /* flex-direction: column; */
    /* gap: 20px; */
}

.upper-panel-row:first-of-type {
    justify-content: space-between;
}

body[mobile] .upper-panel-row:first-of-type > * {
    /* justify-content: space-between;
    width: 100%; */
}

.upper-panel-row:has(nav) {
    justify-content: center;
}

#upper-panel-left {
    --icon-size: 13vw;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 3vw;
}

#upper-panel-right {
    display: flex;
    align-items: center;
    gap: 3vw;
}
</style>
