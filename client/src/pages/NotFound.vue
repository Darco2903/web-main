<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();

function goBack() {
    if (window.history.length <= 2) {
        router.push("/");
    } else {
        router.back();
    }
}
</script>

<template>
    <div class="container">
        <span class="title">404</span>
        <span class="message">{{ t("notFound.message") }}</span>
        <span class="link" @click="goBack">{{ t("notFound.goBack") }}</span>
    </div>
</template>

<style scoped>
.container {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;

    color: #ddd;
    text-align: center;
}

.title {
    font-size: 64px;
    font-weight: bold;
}

.message {
    /* margin-bottom: 20px; */
    font-size: 1.4em;
}

.link {
    color: #ddd;
    text-decoration: none;
    font-size: 1.2em;
}

.link:hover {
    text-decoration: underline;
    cursor: pointer;
}
</style>
