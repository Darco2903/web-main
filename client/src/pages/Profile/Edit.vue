<script setup lang="ts">
import { computed, onMounted, ref, type ComputedRef, type CSSProperties, type Ref } from "vue";
import { IS_MOBILE, wait } from "@darco2903/web-common";
import { authApi, cdnApi } from "@/modules/api";
import { router } from "@/router";
import { useStore as useUserStore } from "@store/user";
import { useI18n } from "vue-i18n";

import LoadingSpinner from "@comp/LoadingSpinner.vue";
import UserIcon from "@comp/UserIcon.vue";

const userStore = useUserStore();
const { t } = useI18n();

if (!userStore.info) {
    alert("You must be logged in to view this page");
    router.push("/");
}

const editPasswordURL = ref(import.meta.env.VITE_AUTH_SERVER_ORIGIN + "/password/edit");
const ready: Ref<boolean> = ref(false);
const userIcon: Ref<string | undefined> = ref(undefined);
const restoreUserIcon: Ref<string | undefined> = ref(undefined);
const border: Ref<boolean> = ref(false);
const userName: Ref<string> = ref("");
let iconDragOver = false;
const savingIcon = ref(false);
let savingUsername = false;

const userIconSize = IS_MOBILE ? "128px" : "192px";
const userIconBorderSize = IS_MOBILE ? "3px" : "6px";
const roundBorderContainerStyle: CSSProperties = {
    flexDirection: IS_MOBILE ? "column-reverse" : "row",
    gap: IS_MOBILE ? "0.8em" : "15px",
};

const borderEdited = computed(() => {
    return !!userStore.info && userStore.info.round_border !== border.value;
});

const iconEdited = computed(() => {
    return userIcon.value !== restoreUserIcon.value;
});

const iconRemoved = computed(() => {
    return userIcon.value === undefined;
});

const nameEdited: ComputedRef<boolean> = computed(() => {
    return !!userStore.info && userStore.info.name !== userName.value;
});

function buttonStyle(state: boolean): CSSProperties {
    return {
        opacity: state ? 1 : 0,
        pointerEvents: state ? "auto" : "none",
    };
}

function onIconDragover() {
    // console.log("dragover");
    iconDragOver = true;
}

function onIconDragleave() {
    // console.log("dragleave");
    iconDragOver = false;
}

function loadIcon(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (typeof e.target?.result !== "string") {
            console.error("Error reading file");
            return;
        }
        userIcon.value = e.target?.result;
    };
    reader.readAsDataURL(file);
}

function onIconInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file: File | undefined = input.files ? input.files[0] : undefined;
    input.value = "";
    if (!file) {
        return;
    }
    loadIcon(file);
}

function onIconDrop(e: DragEvent) {
    iconDragOver = false;
    const file = e.dataTransfer?.files[0];
    if (!file) {
        return;
    }
    loadIcon(file);
}

function removeIcon() {
    userIcon.value = undefined;
}

function cancelIcon() {
    userIcon.value = restoreUserIcon.value;
    border.value = !!userStore.info?.round_border;
}

async function saveIcon() {
    if (savingIcon.value) {
        return;
    }
    savingIcon.value = true;

    let res;
    let reload;

    if (iconEdited.value) {
        const r = await authApi.assets.token({ body: { type: "avatar" } });
        if (r.status !== 200) {
            console.error("Unable to get assets token", r.status, r.body);
            alert("Unable to get assets token");
            savingIcon.value = false;
            return;
        }

        const authorization = `Bearer ${r.body.cdnToken}`;
        // console.log("restoreUserIcon", restoreUserIcon.value);
        // console.log("iconRemoved", iconRemoved.value);

        try {
            if (iconRemoved.value && restoreUserIcon.value !== undefined) {
                console.log("Deleting profile picture");
                res = await cdnApi.service.delete({ headers: { authorization } });
                if (res.status !== 200) {
                    alert("Error deleting profile picture");
                }
            } else if (userIcon.value) {
                console.log("Updating profile picture");
                const blob = await fetch(userIcon.value).then((res) => res.blob());
                const file = new File([blob], "profile.jpg", { type: blob.type });
                res = await cdnApi.service.update({
                    headers: { authorization },
                    body: { file },
                });

                if (res.status === 400) {
                    alert(`Failed to update profile picture: ${res.body.error}`);
                }
            }
        } catch (error) {
            console.error("Error updating profile picture", error);
            alert("Error updating profile picture");
            savingIcon.value = false;
            return;
        }

        if (!res) {
            console.error("No response from profile picture update");
            alert("No response from profile picture update");
            savingIcon.value = false;
            return;
        }

        console.log("Profile picture response", res);

        if (res.status === 200) {
            console.log("Profile picture updated");
            restoreUserIcon.value = userIcon.value;
            reload = true;
        } else {
            alert("An error occurred while updating the profile picture");
        }

        // if (res?.error) {
        //     console.error(res.error);
        //     switch (res.error) {
        //         case "FILE_TOO_LARGE":
        //             alert("File too large");
        //             break;

        //         case "IMAGE_DIMENSIONS_TOO_LARGE":
        //             alert("Image dimensions too large");
        //             break;

        //         case "UNSUPPORTED_FILE_TYPE":
        //             alert("Unsupported file type");
        //             break;

        //         case "INVALID_SESSION_ID":
        //             alert("Unauthorized");
        //             break;

        //         case "INTERNAL_SERVER_ERROR":
        //             alert("Internal server error");
        //             break;

        //         case "CONNECTION_ERROR":
        //             alert("Error connecting to the auth server");
        //             break;

        //         default:
        //             alert("An error occurred while updating the profile picture");
        //             break;
        //     }
        // } else if (res?.result) {
        //     console.log("Profile picture updated");
        //     restoreUserIcon.value = userIcon;
        //     reload = true;
        // }
    }

    if (borderEdited) {
        const resBorder = await authApi.user.updateBorder({ body: { roundBorder: border.value } });
        if (resBorder.status === 200) {
            console.log("Profile picture border updated");
            if (userStore.info) {
                userStore.info.round_border = border.value;
            }
            reload = true;
        } else if (resBorder.status === 400) {
            console.error("Invalid border radius", resBorder.body.issues.find((issue) => issue.message)?.message);
        } else if (resBorder.status === 401 || resBorder.status === 500) {
            console.error("Internal server error", resBorder.body.error);
        }
    }

    if (reload) {
        await sendReload();
    }

    savingIcon.value = false;
}

function cancelUsername() {
    if (!userStore.info) {
        return;
    }
    userName.value = userStore.info.name;
}

async function saveUsername() {
    if (savingUsername || !userStore.info) {
        return;
    }
    savingUsername = true;

    const res = await authApi.user.updateUsername({ body: { username: userName.value } });

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

    // userName.value = user.name;
    userStore.info.name = userName.value;
    console.log("Username updated");
    await sendReload();

    savingUsername = false;
}

async function sendReload() {
    window.dispatchEvent(new StorageEvent("storage", { key: "reloadUser" })); // internal event
    localStorage.setItem("reloadUser", "true");
    await wait(500);
    localStorage.removeItem("reloadUser");
}

onMounted(() => {
    if (!userStore.info) {
        return;
    }

    userName.value = userStore.info.name;
    border.value = userStore.info.round_border;

    userIcon.value = userStore.info.assets.avatar || undefined;
    restoreUserIcon.value = userIcon.value;
    // console.log("UserIcon:", userIcon);
    // console.log("RestoreUserIcon:", restoreUserIcon);

    // ready.value = true;
});
</script>

<template>
    <div>
        <LoadingSpinner class="user-edit-loading" :loading="true" v-show="!ready" />

        <div class="user-edit-content" :style="{ opacity: 1 }">
            <div id="user-data">
                <div class="data-section" id="image-section">
                    <div class="data-edit">
                        <div id="user-image-content">
                            <UserIcon
                                :iconUrl="userIcon"
                                :round-border="border"
                                :size="userIconSize"
                                :border-size="userIconBorderSize"
                                @load="ready = true"
                            />

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
                                <div id="image-round-border-label">{{ t("edit.roundBorder") }}</div>
                                <div id="image-round-border">
                                    <input type="checkbox" id="image-round-border-input" v-model="border" />
                                    <label for="image-round-border-input">
                                        <div id="image-round-border-box"></div>
                                    </label>
                                </div>
                            </div>
                            <button class="but-option on-edit" id="image-remove" @click="removeIcon" :style="buttonStyle(!iconRemoved)">
                                {{ t("edit.remove") }}
                            </button>
                            <button
                                class="but-option on-edit"
                                id="image-cancel"
                                :style="buttonStyle(iconEdited || borderEdited)"
                                :disabled="savingIcon"
                                @click="cancelIcon"
                            >
                                {{ t("edit.cancel") }}
                            </button>
                            <button
                                class="but-option on-edit"
                                id="image-save"
                                :style="buttonStyle(iconEdited || borderEdited)"
                                :disabled="savingIcon"
                                @click="saveIcon"
                            >
                                {{ t("edit.save") }}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="data-section" id="username-section">
                    <div class="data-edit">
                        <div class="username-content">
                            <input type="text" :placeholder="t('edit.username')" v-model="userName" />
                        </div>

                        <div class="on-edit" id="username-options" :style="buttonStyle(nameEdited)">
                            <button class="but-option" id="username-cancel" :disabled="savingUsername" @click="cancelUsername">
                                {{ t("edit.cancel") }}
                            </button>
                            <button class="but-option" id="username-save" :disabled="savingUsername" @click="saveUsername">
                                {{ t("edit.save") }}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="data-section" id="password">
                    <div style="text-align: center; user-select: none">
                        <a class="edit-password-but but-option" :href="editPasswordURL">{{ t("edit.changePassword") }}</a>
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

.edit-password-but {
    padding: 8px 12px;
    text-decoration: none;
}
</style>
