<script setup lang="ts">
import type { User, UserPublic } from "auth-api";
import { computed, onMounted, ref, useId, watch, type ComputedRef } from "vue";
import { useRoute } from "vue-router";
import { IS_MOBILE } from "web-common";
import { authApi } from "@mod/api";
import { store } from "@store/store";

import LoadingSpinner from "@comp/LoadingSpinner.vue";
import UserIcon from "@comp/UserIcon.vue";

const location = useRoute();

const verifyUrl = ref(import.meta.env.VITE_AUTH_SERVER_ORIGIN + "/verify-request");
const userIcon = ref("");
const user = ref<UserPublic | User | null>(null);
const ready = ref(false);
const profileGap = ref(IS_MOBILE ? "30px" : "80px");
const userIconSize = ref(IS_MOBILE ? "64px" : "128px");
const userIconBorderSize = ref(IS_MOBILE ? "3px" : "5px");
const errorMessage = ref("");

const userId = computed(() => {
    return location.params.id === "me" ? store.state.user?.public_id : (location.params.id as string);
});

const ownProfile = computed(() => {
    return userId?.value === store.state.user?.public_id;
});

// const loginUrl = computed(() => {
//     const url = new URL(import.meta.env.VITE_AUTH_SERVER_ORIGIN + "/login");
//     url.searchParams.append("redirect", window.location.href);
//     return url.href;
// });

async function init() {
    if (!userId.value) {
        errorMessage.value = "No user id found";
        console.error("No user id found");
        return;
    } else if (ownProfile.value) {
        user.value = store.state.user;
        document.title = "My Profile";
    } else {
        const res = await authApi.user.fromId({ params: { userId: userId.value } });
        if (res.status === 200) {
            user.value = res.body;
            document.title = `${user.value.name}'s Profile`;
            // console.log("user", user.value);
        } else {
            if (res.status === 400) {
                console.error("Invalid user ID", res.body.issues.find((issue) => issue.message)?.message);
                errorMessage.value = "Invalid user ID";
                // alert("Invalid user ID");
            } else if (res.status === 404 || res.status === 500) {
                errorMessage.value = res.body.error;
                // console.error(res.body.error);
                // alert(res.body.error);
            } else {
                errorMessage.value = "Error loading user";
                // alert("Error loading user");
            }
            return;
        }
    }

    console.log(user.value);
    if (user.value?.assets.avatar) {
        // V2
        // await cdnApi
        //     .profilePictureGet({ params: { userId: user.value.public_id } })
        //     .then((res) => (res.status === 200 && res.body ? new URL(res.body, import.meta.env.VITE_CDN_SERVER_ORIGIN).href : userIconDark))
        //     .catch((err) => {
        //         console.error("Unable to load profile picture", err);
        //         return userIconDark;
        //     })
        //     .then((icon) => {
        //         userIcon.value = icon;
        //     });
        userIcon.value = user.value.assets.avatar;
    }

    ready.value = true;
    // console.log("ready", ready.value);
}

// const user: ComputedRef<Promise<UserPublic | null>> = computed(async () => {
//     const id = Array.isArray(location.params.id) ? location.params.id[0] : location.params.id;
//     console.log("Route param id:", id);
//     if (id === "me") {
//         return store.state.user;
//     } else {
//         return authApi.user
//             .fromId({ params: { userId: id } })
//             .then((res) => (res.status === 200 ? res.body : null))
//             .catch(() => null);
//     }
// });
// watch(
//     () => user.value,
//     (newVal) => {
//         console.log("Route changed", newVal);
//     }
// );

watch(
    () => userId.value,
    async (newId, oldId) => {
        if (newId !== oldId) {
            console.log("Route param id changed:", newId);
            ready.value = false;
            errorMessage.value = "";
            await init();
        }
    }
);

onMounted(async () => {
    console.log("Mounted ProfileHome with id:", userId.value);
    // userId.value = location.params.id === "me" ? store.state.user?.public_id || "" : (location.params.id as string);
    // if (!userId.value) {
    //     if (location.params.id === "me") {
    //         console.error("Not logged in");
    //         alert("You must be logged in to view your profile");
    //         window.location.href = loginUrl.value;
    //     } else {
    //         console.error("No user id found");
    //         alert("No user id found");
    //     }
    //     ready.value = true;
    //     return;
    // }
    // window.addEventListener("storage", async (e) => {
    //     if (!e.key) {
    //         return;
    //     }
    //     console.log("storage", e.key, e.newValue, e.oldValue);
    //     if (e.key === "reloadUser") {
    //         if (ready.value) {
    //             await init();
    //             console.log("User reloaded");
    //         }
    //     }
    // });
    await init();
});
</script>

<template>
    <div>
        <LoadingSpinner class="user-edit-loading" :loading="!ready" v-if="!ready && !errorMessage" />

        <div class="user-profile-content" v-else-if="userId && !errorMessage">
            <div id="profile">
                <div class="profile-first-row">
                    <UserIcon
                        :user-icon="userIcon"
                        :round-border="user?.round_border"
                        :size="userIconSize"
                        :border-size="userIconBorderSize"
                    />

                    <div style="display: flex; flex-direction: row; gap: 10px; align-items: center">
                        <label id="user-name">{{ user?.name }}</label>
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

                    <RouterLink id="edit-profile" to="/profile/edit" v-if="ownProfile">Edit Profile</RouterLink>
                </div>

                <div class="user-profile-verified" v-if="ownProfile && !(user as User).verified ">
                    <span>Email Non Verifié</span>
                    <a class="verify-link" :href="verifyUrl" target="_blank">Vérifier Maintenant</a>
                </div>
            </div>
        </div>

        <div class="user-profile-error-container" v-else>
            <div class="user-profile-error">{{ errorMessage }}</div>
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

#user-name {
    font-size: 24px;
    font-weight: bold;
    color: var(--text-color);
    transition: color var(--theme-time) ease;
}

body[mobile] #user-name {
    font-size: 20px;
}

#edit-profile {
    padding: 10px 20px;
    border-radius: 5px;
    background-color: var(--primary-color);
    color: #222;
    text-decoration: none;
    cursor: pointer;
    font-weight: bold;
    transition: background-color var(--theme-time) ease, color var(--theme-time) ease, filter var(--hover-time) ease;
}

body[mobile] #edit-profile {
    padding: 0.5em 1em;
    font-size: 0.9em;
}

#edit-profile:hover {
    filter: drop-shadow(2px 2px 3px var(--hover-color));
}

.user-profile-verified {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: center;
    margin-top: 10px;
    font-weight: bold;
    font-size: 1.2em;
    color: #ff9900;
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
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 200px;
}

.user-profile-error {
    color: #a80016;
    font-size: 1.2em;
    font-weight: 600;
    text-align: center;
}
</style>
