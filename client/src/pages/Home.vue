<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
    <div id="home-content">
        <div class="category-content">
            <span
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
            >
        </div>
    </div>
</template>

<style scoped>
body {
    font-family: Arial, sans-serif;
    user-select: none;
}

#home-content {
    margin: 50px;
    display: flex;
    flex-direction: column;
    gap: 50px;
}

.category {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.category-title {
    font-size: 24px;
    font-weight: bold;
    /* color: #333; */
    color: #eee;
    text-transform: uppercase;
    padding: 10px 0;
    /* border-bottom: 2px solid #ddd; */
    border-bottom: 2px solid #555;
    /* border-color: #555; */
    transition: color var(--theme-time) ease, border-color var(--theme-time) ease;
}

.category-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 100px;
}

.redirect {
    position: relative;
    padding: 15px 20px;
    border-radius: 7px;
    text-decoration: none;
    color: #fff;
    background-color: #0af;
    transition: filter var(--hover-time) ease;
}

.redirect:hover {
    filter: drop-shadow(3px 3px 3px var(--hover-color)) brightness(1.01);
}

.redirect-name {
}

.redirect-icon {
    position: absolute;
}

/* #filetransfert .redirect-icon {
    top: 75%;
    right: 0;
    transform: translate(-50%, -50%);
    background-image: var(--transfert-icon);
    background-size: contain;
    background-repeat: no-repeat;
    width: 24px;
    height: 24px;
} */
</style>
