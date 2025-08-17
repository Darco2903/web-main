<script lang="ts">
import type { User, UserPublic } from "auth-api";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { IS_MOBILE, wait } from "web-common";
import { api } from "@mod/authApi";
import { key } from "@store/store";

import LoadingSpinner from "@comp/LoadingSpinner.vue";
import UserIcon from "@comp/UserIcon.vue";

const user = ref<UserPublic | User | null>(null);

export default {
    name: "ProfileHome",

    components: {
        LoadingSpinner,
        UserIcon,
    },

    setup() {
        const store = useStore(key);
        // const user = store.state.user;

        return {
            // user,
            store,
        };
    },

    data() {
        return {
            verifyUrl: import.meta.env.VITE_AUTH_SERVER_ORIGIN + "/verify-request",

            userId: "",
            userIcon: "",
            user,
            userBoxImageContainerStyle: {},
            ready: false,

            profileGap: IS_MOBILE ? "30px" : "80px",
            userIconSize: IS_MOBILE ? "64px" : "128px",
            userIconBorderSize: IS_MOBILE ? "3px" : "5px",
        };
    },

    computed: {
        ownProfile() {
            return this.userId && this.userId === this.store.state.user?.public_id;
        },

        loginUrl() {
            const url = new URL(import.meta.env.VITE_AUTH_SERVER_ORIGIN + "/login");
            url.searchParams.append("redirect", window.location.href);
            return url.href;
        },
    },

    methods: {
        async init() {
            let p1;
            if (this.ownProfile) {
                this.user = this.store.state.user;
                document.title = "My Profile";
            } else {
                // p1 = AuthAPI.user.getFromId(this.userId).then((res) => {
                //     if (res.error) {
                //         console.error(res.error);
                //         alert("An error occurred while loading the profile");
                //         return;
                //     }
                //     if (!res.result) {
                //         console.error("No user found");
                //         alert("No user found");
                //         return;
                //     }
                //     this.user = res.user as UserPublic;
                //     document.title = `${this.user.name}'s Profile`;
                //     // console.log("user", this.user);
                // });

                p1 = api.userGetFromId({ params: { userId: this.userId } }).then((res) => {
                    if (res.status === 200) {
                        this.user = res.body;
                        document.title = `${this.user.name}'s Profile`;
                        // console.log("user", this.user);
                    } else {
                        if (res.status === 400) {
                            console.error("Invalid user ID", res.body.issues.find((issue) => issue.message)?.message);
                            alert("Invalid user ID");
                        } else if (res.status === 404 || res.status === 500) {
                            console.error(res.body.error);
                            alert(res.body.error);
                        } else {
                            alert("Error loading user");
                        }
                    }
                });
            }

            // Temporary disable profile picture loading
            // const p2 = AuthAPI.user.picture.profile
            //     .get(this.userId)
            //     .then((blob) => {
            //         if (blob.size !== 0) {
            //             this.userIcon = URL.createObjectURL(blob);
            //             // console.log("userIcon", this.userIcon);
            //         }
            //     })
            //     .catch((err) => {
            //         console.error("Unable to load profile picture", err);
            //     });
            const p2 = wait(100);

            await Promise.allSettled([p1, p2]);
            this.ready = true;
            // console.log("ready", this.ready);
        },
    },

    async mounted() {
        const location = useRoute();
        this.userId = location.params.id === "me" ? this.store.state.user?.public_id || "" : (location.params.id as string);

        if (!this.userId) {
            if (location.params.id === "me") {
                console.error("Not logged in");
                alert("You must be logged in to view your profile");
                window.location.href = this.loginUrl;
            } else {
                console.error("No user id found");
                alert("No user id found");
            }
            this.ready = true;
            return;
        }

        // window.addEventListener("storage", async (e) => {
        //     if (!e.key) {
        //         return;
        //     }

        //     console.log("storage", e.key, e.newValue, e.oldValue);

        //     if (e.key === "reloadUser") {
        //         if (this.ready) {
        //             await this.init();
        //             console.log("User reloaded");
        //         }
        //     }
        // });

        await this.init();
    },
};
</script>

<template>
    <div>
        <LoadingSpinner class="user-edit-loading" :loading="!ready" v-show="!ready" />

        <div class="user-profile-content" v-show="ready && userId">
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
</style>
