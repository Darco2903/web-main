<script setup lang="ts">
import type { User, UserPublic } from "@darco2903/auth-api/client";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { IS_MOBILE } from "@darco2903/web-common";
import { authApi } from "@api/index";
import { useStore as useUserStore } from "@store/user";
import { VITE_AUTH_SERVER_ORIGIN } from "@mod/config";

import LoadingSpinner from "@comp/LoadingSpinner.vue";
import UserIcon from "@comp/UserIcon.vue";

const location = useRoute();
const userStore = useUserStore();
const { t } = useI18n();

const verifyUrl = VITE_AUTH_SERVER_ORIGIN + "/verify-request";
const userIcon = ref("");
const user = ref<UserPublic | User | null>(null);
const ready = ref(false);
const profileGap = ref(IS_MOBILE ? "30px" : "80px");
const userIconSize = ref(IS_MOBILE ? "64px" : "128px");
const userIconBorderSize = ref(IS_MOBILE ? "3px" : "5px");
const errorMessage = ref("");

const userId = computed(() => {
    return location.params.id === "me" ? userStore.getPublicId() : (location.params.id as string);
});

const ownProfile = computed(() => {
    return userId?.value === userStore.getPublicId();
});

async function init() {
    if (!userId.value) {
        if (location.params.id === "me") {
            console.error("You must be logged in to view your profile");
            errorMessage.value = t("profileHome.loginRequired");
            // alert("You must be logged in to view your profile");
            // window.location.href = loginUrl.value;
        } else {
            console.error("No user id found");
            errorMessage.value = t("profileHome.noUserId");
        }
        return;
    } else if (ownProfile.value) {
        user.value = userStore.info;
        document.title = t("profileHome.myProfile");
    } else {
        const res = await authApi.user.fromId({ params: { userId: userId.value } });
        if (res.status === 200) {
            user.value = res.body;
            document.title = t("profileHome.otherProfile", { username: user.value.name });
            // console.log("user", user.value);
        } else {
            if (res.status === 400) {
                console.error("Invalid user ID", res.body.issues.find((issue) => issue.message)?.message);
                errorMessage.value = t("profileHome.invalidUserId");
                // alert("Invalid user ID");
            } else if (res.status === 404 || res.status === 500) {
                errorMessage.value = res.body.error;
                // console.error(res.body.error);
                // alert(res.body.error);
            } else {
                errorMessage.value = t("profileHome.failedToLoadUser");
                // alert("Error loading user");
            }
            return;
        }
    }

    console.log(user.value);
    if (user.value?.assets.avatar) {
        userIcon.value = user.value.assets.avatar;
    }

    ready.value = true;
    // console.log("ready", ready.value);
}

watch(
    () => userId.value,
    async (newId, oldId) => {
        if (newId !== oldId) {
            // console.log("Route param id changed:", newId);
            ready.value = false;
            errorMessage.value = "";
            await init();
        }
    },
);

onMounted(async () => {
    await init();
});
</script>

<template>
    <div>
        <div class="flex row" style="margin: 24px 16px" v-if="!errorMessage">
            <div class="go-home usr-btn">
                <RouterLink to="/" class="text" style="text-decoration: none"><-</RouterLink>
            </div>
        </div>

        <LoadingSpinner class="user-edit-loading" :loading="!ready" v-if="!ready && !errorMessage" />

        <div class="user-profile-content" v-else-if="userId && !errorMessage">
            <div id="profile">
                <div class="profile-first-row">
                    <UserIcon
                        :iconUrl="userIcon"
                        :round-border="user?.round_border"
                        :size="userIconSize"
                        :border-size="userIconBorderSize"
                    />

                    <div style="display: flex; flex-direction: row; gap: 10px; align-items: center">
                        <label class="user-name text">{{ user?.name }}</label>
                        <img
                            class="verified-icon"
                            src="@icons/verified-96px.png"
                            alt="Verified"
                            title="Verified"
                            width="32"
                            height="32"
                            v-if="ownProfile && (user as User).verified"
                        />
                    </div>

                    <RouterLink class="usr-btn no-underline" to="/profile/edit" :disabled="true" v-if="ownProfile">{{
                        t("profileHome.editProfile")
                    }}</RouterLink>
                </div>

                <div class="user-profile-verified" v-if="ownProfile && !(user as User).verified">
                    <span>{{ t("profileHome.emailUnverified") }}</span>
                    <a class="verify-link" :href="verifyUrl" target="_blank">{{ t("profileHome.verifyNow") }}</a>
                </div>
            </div>
        </div>

        <div class="flex col center user-profile-error-container" style="gap: 24px" v-else>
            <div class="user-profile-error">{{ errorMessage }}</div>

            <div class="go-home usr-btn">
                <RouterLink to="/" class="text" style="text-decoration: none">{{ t("common.goHome.goHome") }}</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.user-edit-loading {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #00000088;
    z-index: 100;
    padding: 20px;
    border-radius: 6px;
}

.user-profile-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 50px;
}

#profile {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    margin-top: 20px;
}

.profile-first-row {
    display: flex;
    flex-direction: row;
    gap: v-bind(profileGap);
    align-items: center;
}

.user-name {
    font-size: 24px;
    font-weight: bold;
}

body[mobile] .user-name {
    font-size: 20px;
}

.user-profile-verified {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: center;
    margin-top: 10px;
    font-weight: bold;
    font-size: 1.2em;
    color: var(--color-warning);
}

.verify-link {
    text-decoration: none;
    padding: 10px 12px;
    border: 2px solid #fff;
    border-radius: 5px;
    color: #eee;
    background-color: #0004;
}

.user-profile-error-container {
    /* display: flex;
    justify-content: center;
    align-items: center; */
    /* width: 100%; */
    height: 200px;
}

.user-profile-error {
    color: #a80016;
    font-size: 1.2em;
    font-weight: 600;
    text-align: center;
}
</style>
