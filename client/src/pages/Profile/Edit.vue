<script lang="ts">
import { type CSSProperties } from "vue";
import { useStore } from "vuex";
import { IS_MOBILE, wait } from "web-common";
import { api } from "@mod/authApi";
import { key } from "@store/store";

import LoadingSpinner from "@comp/LoadingSpinner.vue";
import UserIcon from "@comp/UserIcon.vue";

export default {
    name: "ProfileEdit",

    components: {
        LoadingSpinner,
        UserIcon,
    },

    setup() {
        const store = useStore(key);
        const user = store.state.user;

        if (!user) {
            alert("You must be logged in to view this page");

            const loginUrl = new URL(import.meta.env.VITE_AUTH_SERVER_ORIGIN + "/login");
            loginUrl.searchParams.append("redirect", window.location.href);
            window.location.href = loginUrl.href;
            // window.close();
            return null;
        }

        return {
            user,
            IS_MOBILE,
        };
    },

    data() {
        return {
            initialized: false,
            ready: false,
            userIcon: "" as string | ArrayBuffer | null | undefined,
            restoreUserIcon: "" as string | ArrayBuffer | null | undefined,
            border: false,
            // user: this.$store.state.user,
            userName: "",
            iconDragOver: false,

            savingIcon: false,
            savingUsername: false,

            userIconSize: IS_MOBILE ? "128px" : "192px",
            userIconBorderSize: IS_MOBILE ? "3px" : "6px",
            roundBorderContainerStyle: {
                flexDirection: IS_MOBILE ? "column-reverse" : "row",
                gap: IS_MOBILE ? "0.8em" : "15px",
            } as CSSProperties,
        };
    },

    computed: {
        borderEdited() {
            return this.user.round_border !== this.border;
        },

        iconEdited() {
            return this.userIcon !== this.restoreUserIcon;
        },

        iconRemoved() {
            return this.userIcon === null;
        },

        nameEdited() {
            return this.user.name !== this.userName;
        },
    },

    methods: {
        buttonStyle(state: boolean): CSSProperties {
            return {
                opacity: state ? 1 : 0,
                pointerEvents: state ? "auto" : "none",
            };
        },

        onIconDragover() {
            // console.log("dragover");
            this.iconDragOver = true;
        },

        onIconDragleave() {
            // console.log("dragleave");
            this.iconDragOver = false;
        },

        loadIcon(file: File) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.userIcon = e.target?.result;
            };
            reader.readAsDataURL(file);
        },

        onIconInput(e: Event) {
            const input = e.target as HTMLInputElement;
            const file: File | undefined = input.files ? input.files[0] : undefined;
            input.value = "";
            if (!file) {
                return;
            }
            this.loadIcon(file);
        },

        onIconDrop(e: DragEvent) {
            this.iconDragOver = false;
            const file = e.dataTransfer?.files[0];
            if (!file) {
                return;
            }
            this.loadIcon(file);
        },

        removeIcon() {
            this.userIcon = null;
        },

        cancelIcon() {
            this.userIcon = this.restoreUserIcon;
            this.border = this.user.round_border;
        },

        async saveIcon() {
            if (this.savingIcon) {
                return;
            }
            this.savingIcon = true;

            let res;
            let reload;

            if (this.iconEdited) {
                console.error("Temporary disable icon editing");
                return;

                // if (!this.iconRemoved) {
                //     const blob = await fetch(this.userIcon as string).then((res) => res.blob());
                //     res = await AuthAPI.user.picture.profile.update(blob);
                // } else {
                //     res = await AuthAPI.user.picture.profile.delete();
                // }

                if (res?.error) {
                    console.error(res.error);
                    switch (res.error) {
                        case "FILE_TOO_LARGE":
                            alert("File too large");
                            break;

                        case "IMAGE_DIMENSIONS_TOO_LARGE":
                            alert("Image dimensions too large");
                            break;

                        case "UNSUPPORTED_FILE_TYPE":
                            alert("Unsupported file type");
                            break;

                        case "INVALID_SESSION_ID":
                            alert("Unauthorized");
                            break;

                        case "INTERNAL_SERVER_ERROR":
                            alert("Internal server error");
                            break;

                        case "CONNECTION_ERROR":
                            alert("Error connecting to the auth server");
                            break;

                        default:
                            alert("An error occurred while updating the profile picture");
                            break;
                    }
                } else if (res?.result) {
                    console.log("Profile picture updated");
                    this.restoreUserIcon = this.userIcon;
                    reload = true;
                }
            }

            if (this.borderEdited) {
                // const resBorder = await AuthAPI.user.picture.profile.border(this.border);
                // if (resBorder?.error) {
                //     console.error(resBorder.error);
                // } else if (resBorder?.result) {
                //     console.log("Profile picture border updated");
                //     this.user.round_border = this.border;
                //     reload = true;
                // }

                const resBorder = await api.pictureSetBorder({ body: { roundBorder: this.border } });
                if (resBorder.status === 200) {
                    console.log("Profile picture border updated");
                    this.user.round_border = this.border;
                    reload = true;
                } else if (resBorder.status === 400) {
                    console.error("Invalid border radius", resBorder.body.issues.find((issue) => issue.message)?.message);
                } else if (resBorder.status === 401 || resBorder.status === 500) {
                    console.error("Internal server error", resBorder.body.error);
                }
            }

            if (reload) {
                await this.sendReload();
            }

            this.savingIcon = false;
        },

        cancelUsername() {
            this.user.name = this.userName;
        },

        async saveUsername() {
            if (this.savingUsername) {
                return;
            }
            this.savingUsername = true;

            // const res = await AuthAPI.user.updateUsername(this.user.name, "");
            // if (res.error) {
            //     console.error("Update username error", res.error);
            //     alert("Unable to update username");
            //     return;
            // }

            const res = await api.userUpdateUsername({ body: { username: this.user.name } });

            if (res.status === 200) {
                // console.log("Username updated");
            } else if (res.status === 400) {
                console.error("Invalid username", res.body.issues.find((issue) => issue.message)?.message);
                alert("Invalid username");
                return;
            } else if (res.status === 401 || res.status === 500) {
                console.error("Internal server error", res.body.error);
                alert("Internal server error");
                return;
            }

            this.userName = this.user.name;
            console.log("Username updated");
            await this.sendReload();

            this.savingUsername = false;
        },

        async sendReload() {
            window.dispatchEvent(new StorageEvent("storage", { key: "reloadUser" })); // internal event
            localStorage.setItem("reloadUser", "true");
            await wait(500);
            localStorage.removeItem("reloadUser");
        },

        async init() {
            this.userName = this.user.name;
            this.border = this.user.round_border;

            // Temporary disable profile picture loading
            // await AuthAPI.user.picture.profile
            //     .get(this.user.public_id)
            //     .then((blob) => {
            //         if (blob.size === 0) {
            //             this.userIcon = null;
            //             return;
            //         }
            //         const url = URL.createObjectURL(blob);
            //         this.userIcon = url;
            //         this.restoreUserIcon = url;
            //     })
            //     .catch((err) => {
            //         console.error("Unable to load profile picture", err);
            //         this.userIcon = null;
            //     });

            this.ready = true;
        },
    },

    async mounted() {
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

        <div class="user-edit-content" v-show="ready">
            <div id="user-data">
                <div class="data-section" id="image-section">
                    <div class="data-edit">
                        <div id="user-image-content">
                            <UserIcon :user-icon="userIcon" :round-border="border" :size="userIconSize" :border-size="userIconBorderSize" />

                            <div
                                id="image-input-container"
                                @dragover.prevent="onIconDragover"
                                @dragleave.prevent="onIconDragleave"
                                @drop.prevent="onIconDrop"
                                :drag-over="iconDragOver"
                            >
                                <div id="image-input-div">
                                    <div id="drag-drop">Drag & Drop</div>
                                    <label id="image-input-but" for="image-input">Upload</label>
                                    <input type="file" name="profile-pic" id="image-input" accept="image/*" @input="onIconInput" />
                                </div>
                            </div>
                        </div>

                        <div id="image-options">
                            <div id="image-round-border-container" :style="roundBorderContainerStyle">
                                <div id="image-round-border-label">Round Border</div>
                                <div id="image-round-border">
                                    <input type="checkbox" id="image-round-border-input" v-model="border" />
                                    <label for="image-round-border-input">
                                        <div id="image-round-border-box"></div>
                                    </label>
                                </div>
                            </div>
                            <button class="but-option on-edit" id="image-remove" @click="removeIcon" :style="buttonStyle(!iconRemoved)">
                                Remove
                            </button>
                            <button
                                class="but-option on-edit"
                                id="image-cancel"
                                :style="buttonStyle(iconEdited || borderEdited)"
                                :disabled="savingIcon"
                                @click="cancelIcon"
                            >
                                Cancel
                            </button>
                            <button
                                class="but-option on-edit"
                                id="image-save"
                                :style="buttonStyle(iconEdited || borderEdited)"
                                :disabled="savingIcon"
                                @click="saveIcon"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>

                <div class="data-section" id="username-section">
                    <div class="data-edit">
                        <div class="username-content">
                            <input type="text" placeholder="Username" v-model="user.name" />
                        </div>

                        <div class="on-edit" id="username-options" :style="buttonStyle(nameEdited)">
                            <button class="but-option" id="username-cancel" :disabled="savingUsername" @click="cancelUsername">
                                Cancel
                            </button>
                            <button class="but-option" id="username-save" :disabled="savingUsername" @click="saveUsername">Save</button>
                        </div>
                    </div>
                </div>

                <!-- <div class="data-section" id="email-password">
                    <div class="data-edit">
                        <input type="text" id="email-input" placeholder="Email" />
                        <input type="password" id="new-password" placeholder="New Password" />
                        <input type="password" id="confirm-new-password" placeholder="Confirm New Password" />
                    </div>

                    <input type="password" id="current-password" placeholder="Current Password" />
                </div> -->
            </div>

            <!-- <div id="buttons">
                <button id="save">Save</button>
                <button id="cancel">Cancel</button>
            </div> -->
        </div>
    </div>
</template>

<style scoped>
body {
    overflow-y: auto;
    overflow-x: hidden;
}

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 10px 8px;
    display: inline-block;
    border-radius: 0;
    /* border: 2px solid #222245; */
    border: 2px solid #eee;
    box-sizing: border-box;
    outline: none;
    /* color: #222; */
    color: #eee;
    background-color: #25254d;
    font-size: 16px;
    transition: border var(--theme-time) ease, background-color var(--theme-time) ease, color var(--theme-time) ease;
}

input[type="text"]::placeholder,
input[type="password"]::placeholder {
    /* color: #555; */
    color: #bbb;
    transition: color var(--theme-time) ease;
}

.on-edit {
    transition: opacity 0.3s ease;
}

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

.user-edit-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 50px;
}

#user-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 80px;
}

.data-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
}

.data-edit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    width: 100%;
}

#user-image-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 60px;
}

body[mobile] #user-image-content {
    /* gap: 3em; */
}

#image-input-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 96px;
    height: 96px;
    /* border: 2px dashed #222245; */
    border: 2px dashed #eee;
    transition: background-color 0.3s ease, border var(--theme-time) ease;
}

body[mobile] #image-input-container {
    /* width: 6em; */
    /* height: 6em; */
}

#image-input-container[drag-over="true"] {
    background-color: #222245bb;
}

#image-input-div {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 65%;
}

#drag-drop {
    font-size: 14px;
    user-select: none;
    /* color: #222245; */
    color: #eee;
    transition: color 0.3s ease;
}

#image-input-container[drag-over="true"] #drag-drop {
    color: #fff;
}

#image-input-but {
    padding: 8px;
    border: 2px solid #56568f;
    background-color: #1e1e3f;
    color: #fff;
    user-select: none;
}

#image-input-but:hover {
    cursor: pointer;
}

#image-input {
    display: none;
}

#image-options,
#username-options {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 30px;
}

#image-round-border-container {
    display: flex;
    /* flex-direction: row; */
    align-items: center;
    gap: 15px;
}

/* body[mobile] #image-round-border-container {
    flex-direction: column;
    gap: 0.8em;
} */

#image-round-border-label {
    user-select: none;
    color: var(--text-color);
    transition: color var(--theme-time) ease;
}

body[mobile] #image-round-border-label {
    font-size: 0.9em;
}

.data-section {
    opacity: 1;
    transition: opacity 0.3s ease;
}

.data-section[disabled],
.but-option:disabled {
    opacity: 0.7 !important;
    pointer-events: none !important;
}

.but-option {
    padding: 8px;
    border: 2px solid #56568f;
    background-color: #1e1e3f;
    color: #fff;
    user-select: none;
    cursor: pointer;
}

#image-round-border-input {
    display: none;
}

#image-round-border {
    position: relative;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
}

#image-round-border label {
    cursor: pointer;
}

#image-round-border-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    /* border: 4px solid #222245; */
    border: 4px solid #56568f;
    transition: border-radius 0.2s, border-color var(--theme-time) ease, background-color 0.2s;
}

body:not([mobile]) #image-round-border:hover #image-round-border-box {
    border-radius: 30%;
}

input:checked + label #image-round-border-box {
    border-radius: 50%;
    /* background-color: var(--background-color-dark); */
    background-color: #222245;
}
</style>
