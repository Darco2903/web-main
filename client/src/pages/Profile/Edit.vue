<script setup lang="ts">
import { computed, onMounted, ref, type CSSProperties } from "vue";
import { useI18n } from "vue-i18n";
import { err, ok, ResultAsync } from "neverthrow";
import type { User } from "@darco2903/auth-api/client";
import { IS_MOBILE } from "@darco2903/web-common";
import { authApi, cdnApi } from "@api/index";
import { useStore as useUserStore } from "@store/user";
import { useConfirmStore } from "@store/ui";
import { AUTH_SERVER_ORIGIN } from "@mod/config";

import LoadingSpinner from "@comp/LoadingSpinner.vue";
import UserIcon from "@comp/UserIcon.vue";

const confirmStore = useConfirmStore();
const userStore = useUserStore();
const { t } = useI18n();

const currentUrl = window.location.href;

const editPasswordURL = ref<string>(AUTH_SERVER_ORIGIN + "/password/edit?redirect=" + encodeURIComponent(currentUrl));
const setupTOTPURL = ref<string>(AUTH_SERVER_ORIGIN + "/two-factor/setup?redirect=" + encodeURIComponent(currentUrl));
const manageTOTPURL = ref<string>(AUTH_SERVER_ORIGIN + "/two-factor/manage?redirect=" + encodeURIComponent(currentUrl));
const ready = ref<boolean>(false);
const userIcon = ref<string | undefined>(undefined);
const restoreUserIcon = ref<string | undefined>(undefined);
const border = ref<boolean>(false);
const userName = ref<string>("");
let iconDragOver: boolean = false;
const savingIcon = ref<boolean>(false);
const savingUsername = ref<boolean>(false);

const userIconSize = IS_MOBILE ? "128px" : "192px";
const userIconBorderSize = IS_MOBILE ? "3px" : "6px";
const roundBorderContainerStyle: CSSProperties = {
  flexDirection: IS_MOBILE ? "column-reverse" : "row",
  gap: IS_MOBILE ? "0.8em" : "15px",
};

const borderEdited = computed<boolean>(() => {
  return userStore.info !== null && userStore.info.round_border !== border.value;
});

const iconEdited = computed<boolean>(() => {
  return userIcon.value !== restoreUserIcon.value;
});

const iconRemoved = computed<boolean>(() => {
  return userIcon.value === undefined;
});

const nameEdited = computed<boolean>(() => {
  return !!userStore.info && userStore.info.name !== userName.value;
});

function buttonStyle(state: boolean): CSSProperties {
  return {
    opacity: state ? 1 : 0,
    pointerEvents: state ? "auto" : "none",
  };
}

function onIconDragover(): void {
  // console.log("dragover");
  iconDragOver = true;
}

function onIconDragleave(): void {
  // console.log("dragleave");
  iconDragOver = false;
}

function loadIcon(file: File): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (typeof e.target?.result !== "string") {
      console.error("Error reading file");
      return;
    }
    userIcon.value = e.target?.result;
    // console.log("Loaded icon:", userIcon.value);
  };
  reader.readAsDataURL(file);
}

function onIconInput(e: Event): void {
  const input = e.target as HTMLInputElement;
  const file: File | undefined = input.files ? input.files[0] : undefined;
  input.value = "";
  if (!file) {
    return;
  }
  loadIcon(file);
}

function onIconDrop(e: DragEvent): void {
  iconDragOver = false;
  const file = e.dataTransfer?.files[0];
  if (!file) {
    return;
  }
  loadIcon(file);
}

function removeIcon(): void {
  userIcon.value = undefined;
}

function cancelIcon(): void {
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
      await confirmStore.alert("Unable to get assets token");
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
        if (res.status !== 204) {
          await confirmStore.alert("Error deleting profile picture");
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
          await confirmStore.alert(`Failed to update profile picture: ${res.body.error}`);
        }
      }
    } catch (error) {
      console.error("Error updating profile picture", error);
      await confirmStore.alert("Error updating profile picture");
      savingIcon.value = false;
      return;
    }

    if (!res) {
      console.error("No response from profile picture update");
      await confirmStore.alert("No response from profile picture update");
      savingIcon.value = false;
      return;
    }

    console.log("Profile picture response", res);

    if (res.status === 204) {
      console.log("Profile picture updated");
      restoreUserIcon.value = userIcon.value;
      reload = true;
    } else {
      await confirmStore.alert("An error occurred while updating the profile picture");
    }

    // if (res?.error) {
    //     console.error(res.error);
    //     switch (res.error) {
    //         case "FILE_TOO_LARGE":
    //             await confirmStore.alert("File too large");
    //             break;

    //         case "IMAGE_DIMENSIONS_TOO_LARGE":
    //             await confirmStore.alert("Image dimensions too large");
    //             break;

    //         case "UNSUPPORTED_FILE_TYPE":
    //             await confirmStore.alert("Unsupported file type");
    //             break;

    //         case "INVALID_SESSION_ID":
    //             await confirmStore.alert("Unauthorized");
    //             break;

    //         case "INTERNAL_SERVER_ERROR":
    //             await confirmStore.alert("Internal server error");
    //             break;

    //         case "CONNECTION_ERROR":
    //             await confirmStore.alert("Error connecting to the auth server");
    //             break;

    //         default:
    //             await confirmStore.alert("An error occurred while updating the profile picture");
    //             break;
    //     }
    // } else if (res?.result) {
    //     console.log("Profile picture updated");
    //     restoreUserIcon.value = userIcon;
    //     reload = true;
    // }
  }

  if (borderEdited.value) {
    const roundBorder = border.value;
    await ResultAsync.fromPromise(
      authApi.user.updateBorder({ body: { roundBorder } }),
      (e) => `Failed to update profile picture border: ${e instanceof Error ? e.message : String(e)}`,
    )
      .andThen((res) => {
        console.log("Profile picture border response", res);
        if (res.status === 204) {
          return ok();
        } else if (res.status === 400) {
          console.error("Invalid border radius", res.body.issues.find((issue) => issue.message)?.message);
          return err("Invalid border radius");
        } else if (res.status === 401 || res.status === 500) {
          console.error("Internal server error", res.body.error);
          return err("Internal server error");
        } else {
          console.error("Unexpected response", res);
          return err("An error occurred while updating the profile picture border");
        }
      })
      .andTee(() => {
        console.log("Profile picture border updated");

        // Updated locally, no need to reload the user for it
        if (userStore.info) {
          userStore.info.round_border = roundBorder;
        }
      })
      .orTee((e) => confirmStore.alert(e));
  }

  if (reload) {
    await refreshUser();
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
  if (savingUsername.value || !userStore.info) {
    return;
  }
  savingUsername.value = true;

  const username = userName.value;
  const res = await ResultAsync.fromPromise(
    authApi.user.updateUsername({ body: { username } }),
    (e) => `Failed to update username: ${e instanceof Error ? e.message : String(e)}`,
  ).andThen((res) => {
    if (res.status === 204) {
      return ok();
    } else if (res.status === 400) {
      console.error("Invalid username", res.body.issues.find((issue) => issue.message)?.message);
      return err("Invalid username");
    } else if (res.status === 401 || res.status === 500) {
      console.error("Failed to update username", res.body.error);
      return err("Failed to update username");
    } else {
      console.error("Unexpected response", res);
      return err("An error occurred while updating the username");
    }
  });

  if (res.isOk()) {
    if (userStore.info) {
      userStore.info.name = username;
    }
    console.log("Username updated");
    // The username is saved, a failed refresh only leaves the store stale
    await refreshUser();
  } else {
    await confirmStore.alert(res.error);
  }

  savingUsername.value = false;
}

function refreshUser(): ResultAsync<User, string> {
  return userStore.refresh();
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

  ready.value = true;
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
                  <div class="text" id="drag-drop">Drag & Drop</div>
                  <label class="usr-btn" id="image-input-but" style="transform: translateY(15%)" for="image-input">
                    Upload
                  </label>
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

              <button class="usr-btn" id="image-remove" @click="removeIcon" :style="buttonStyle(!iconRemoved)">
                {{ t("edit.remove") }}
              </button>

              <button
                class="usr-btn"
                id="image-cancel"
                :style="buttonStyle(iconEdited || borderEdited)"
                :disabled="savingIcon"
                @click="cancelIcon"
              >
                {{ t("edit.cancel") }}
              </button>

              <button
                class="usr-btn"
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
              <input type="text" class="usr-input" :placeholder="t('edit.username')" v-model="userName" />
            </div>

            <div id="username-options">
              <button
                class="usr-btn"
                id="username-cancel"
                :style="buttonStyle(nameEdited)"
                :disabled="savingUsername"
                @click="cancelUsername"
              >
                {{ t("edit.cancel") }}
              </button>

              <button
                class="usr-btn"
                id="username-save"
                :style="buttonStyle(nameEdited)"
                :disabled="savingUsername"
                @click="saveUsername"
              >
                {{ t("edit.save") }}
              </button>
            </div>
          </div>
        </div>

        <div class="data-section flex col" style="gap: 42px">
          <div class="password-change" style="text-align: center; user-select: none">
            <a class="edit-password-but usr-btn" :href="editPasswordURL" style="text-decoration: none">
              {{ t("edit.changePassword") }}
            </a>
          </div>

          <div class="totp-change" style="text-align: center; user-select: none">
            <a
              class="edit-password-but usr-btn"
              :href="setupTOTPURL"
              v-if="userStore.info?.totp_enabled === false"
              style="text-decoration: none"
            >
              {{ t("edit.setupTOTP") }}
            </a>
            <a class="edit-password-but usr-btn" :href="manageTOTPURL" v-else style="text-decoration: none">
              {{ t("edit.disableTOTP") }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  overflow-y: auto;
  overflow-x: hidden;
}

.on-edit {
  /* transition: opacity 0.3s ease; */
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
  border: 2px dashed var(--text);
  transition:
    background-color 0.3s ease,
    border 200ms ease;
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
  transition: color 0.3s ease;
}

#image-input-container[drag-over="true"] #drag-drop {
  color: #fff;
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
  color: var(--text);
  transition: color 200ms ease;
}

body[mobile] #image-round-border-label {
  font-size: 0.9em;
}

.data-section {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.data-section[disabled] {
  opacity: 0.7 !important;
  pointer-events: none !important;
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
  border: 4px solid var(--border);
  transition:
    border-radius 0.2s,
    border-color 200ms ease,
    background-color 0.2s;
}

body:not([mobile]) #image-round-border:hover #image-round-border-box {
  border-radius: 30%;
}

input:checked + label #image-round-border-box {
  border-radius: 50%;
  background-color: var(--color-primary);
}
</style>
