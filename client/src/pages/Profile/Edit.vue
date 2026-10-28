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
const iconDragOver = ref<boolean>(false);
const savingIcon = ref<boolean>(false);
const savingUsername = ref<boolean>(false);

const userIconSize = IS_MOBILE ? "112px" : "160px";
const userIconBorderSize = IS_MOBILE ? "3px" : "5px";

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
  iconDragOver.value = true;
}

function onIconDragleave(): void {
  // console.log("dragleave");
  iconDragOver.value = false;
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
  iconDragOver.value = false;
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
  <div class="user-edit">
    <LoadingSpinner class="user-edit-loading g-glass-strong" :loading="true" v-show="!ready" />

    <section class="edit-section g-glass g-card" id="image-section">
      <h2>{{ t("edit.avatar") }}</h2>

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
          class="g-dropzone"
          @dragover.prevent="onIconDragover"
          @dragleave.prevent="onIconDragleave"
          @drop.prevent="onIconDrop"
          :data-over="iconDragOver"
        >
          <span>{{ t("edit.dragDrop") }}</span>
          <label class="g-btn g-btn-sm" for="image-input">{{ t("edit.upload") }}</label>
          <input type="file" name="profile-pic" id="image-input" accept="image/*" @input="onIconInput" />
        </div>
      </div>

      <div class="section-footer">
        <label class="g-field-row">
          <input type="checkbox" class="g-shape-toggle" v-model="border" />
          {{ t("edit.roundBorder") }}
        </label>

        <div class="section-actions">
          <button class="g-btn" id="image-remove" @click="removeIcon" :style="buttonStyle(!iconRemoved)">
            {{ t("edit.remove") }}
          </button>

          <button
            class="g-btn"
            id="image-cancel"
            :style="buttonStyle(iconEdited || borderEdited)"
            :disabled="savingIcon"
            @click="cancelIcon"
          >
            {{ t("edit.cancel") }}
          </button>

          <button
            class="g-btn g-btn-primary"
            id="image-save"
            :style="buttonStyle(iconEdited || borderEdited)"
            :disabled="savingIcon"
            @click="saveIcon"
          >
            <span class="g-spinner g-spinner-sm" v-if="savingIcon"></span>
            {{ t("edit.save") }}
          </button>
        </div>
      </div>
    </section>

    <section class="edit-section g-glass g-card" id="username-section">
      <h2>{{ t("edit.username") }}</h2>

      <div class="section-footer">
        <input type="text" class="g-input username-input" :placeholder="t('edit.username')" v-model="userName" />

        <div class="section-actions">
          <button
            class="g-btn"
            id="username-cancel"
            :style="buttonStyle(nameEdited)"
            :disabled="savingUsername"
            @click="cancelUsername"
          >
            {{ t("edit.cancel") }}
          </button>

          <button
            class="g-btn g-btn-primary"
            id="username-save"
            :style="buttonStyle(nameEdited)"
            :disabled="savingUsername"
            @click="saveUsername"
          >
            <span class="g-spinner g-spinner-sm" v-if="savingUsername"></span>
            {{ t("edit.save") }}
          </button>
        </div>
      </div>
    </section>

    <section class="edit-section g-glass g-card" id="security-section">
      <h2>{{ t("edit.security") }}</h2>

      <div class="security-actions">
        <a class="g-btn" :href="editPasswordURL">{{ t("edit.changePassword") }}</a>

        <a class="g-btn" :href="setupTOTPURL" v-if="userStore.info?.totp_enabled === false">
          {{ t("edit.setupTOTP") }}
        </a>
        <a class="g-btn" :href="manageTOTPURL" v-else>{{ t("edit.disableTOTP") }}</a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.user-edit {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

.user-edit-loading {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  padding: 20px;
  border-radius: var(--g-radius-lg);
}

.edit-section {
  display: flex;
  flex-direction: column;
  gap: 20px;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
}

#user-image-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32px;
}

#image-input-container {
  flex: 1;
  align-self: stretch;
}

body[mobile] #user-image-content {
  flex-direction: column;
  gap: 20px;
}

body[mobile] #image-input-container {
  align-self: auto;
  width: 100%;
  box-sizing: border-box;
}

#image-input {
  display: none;
}

.section-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.username-input {
  flex: 1;
  min-width: 200px;
}

.security-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
