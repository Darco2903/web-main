<script setup lang="ts">
import type { User, UserPublic } from "@darco2903/auth-api/client";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { IS_MOBILE } from "@darco2903/web-common";
import { authApi } from "@api/index";
import { useStore as useUserStore } from "@store/user";
import { AUTH_SERVER_ORIGIN } from "@mod/config";

import LoadingSpinner from "@comp/LoadingSpinner.vue";
import UserIcon from "@comp/UserIcon.vue";
import { err, ok, ResultAsync } from "neverthrow";

const location = useRoute();
const userStore = useUserStore();
const { t } = useI18n();

const verifyUrl = AUTH_SERVER_ORIGIN + "/verify-request";
const userIcon = ref<string>("");
const user = ref<UserPublic | User | null>(null);
const ready = ref<boolean>(false);
const profileGap = ref<string>(IS_MOBILE ? "20px" : "40px");
const userIconSize = ref<string>(IS_MOBILE ? "64px" : "128px");
const userIconBorderSize = ref<string>(IS_MOBILE ? "3px" : "5px");
const errorMessage = ref<string>("");

const userId = computed<string | null>(() => {
  return location.params.id === "me" ? userStore.getPublicId() : (location.params.id as string);
});

const ownProfile = computed<boolean>(() => {
  return userId?.value === userStore.getPublicId();
});

async function init() {
  if (!userId.value) {
    if (location.params.id === "me") {
      console.error("You must be logged in to view your profile");
      errorMessage.value = t("profileHome.loginRequired");
      // await confirmStore.alert("You must be logged in to view your profile");
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
    await ResultAsync.fromPromise(
      authApi.user.fromId({ params: { userId: userId.value } }),
      (e) => new Error("Failed to load user: " + (e instanceof Error ? e.message : String(e))),
    ).andThen((res) => {
      if (res.status === 200) {
        user.value = res.body;
        document.title = t("profileHome.otherProfile", { username: user.value.name });
        // console.log("user", user.value);
        return ok();
      } else {
        if (res.status === 400) {
          console.error("Invalid user ID", res.body.issues.find((issue) => issue.message)?.message);
          errorMessage.value = t("profileHome.invalidUserId");
          // await confirmStore.alert("Invalid user ID");
        } else if (res.status === 404 || res.status === 500) {
          errorMessage.value = res.body.error;
          // console.error(res.body.error);
          // await confirmStore.alert(res.body.error);
        } else {
          errorMessage.value = t("profileHome.failedToLoadUser");
          // await confirmStore.alert("Error loading user");
        }
        return err();
      }
    });
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
  <div class="profile-page">
    <div class="back-row" v-if="!errorMessage">
      <RouterLink to="/" class="g-btn g-btn-icon" :aria-label="t('common.goHome.goHome')">←</RouterLink>
    </div>

    <LoadingSpinner class="profile-loading g-glass-strong" :loading="!ready" v-if="!ready && !errorMessage" />

    <div class="user-profile-content" v-else-if="userId && !errorMessage">
      <div id="profile" class="g-glass g-card">
        <div class="profile-first-row">
          <UserIcon
            :iconUrl="userIcon"
            :round-border="user?.round_border"
            :size="userIconSize"
            :border-size="userIconBorderSize"
          />

          <div class="profile-name">
            <span class="user-name">{{ user?.name }}</span>
            <img
              class="verified-icon"
              src="@icons/verified-96px.png"
              alt="Verified"
              title="Verified"
              width="28"
              height="28"
              v-if="ownProfile && (user as User).verified"
            />
          </div>

          <RouterLink class="g-btn g-btn-primary" to="/profile/edit" v-if="ownProfile">
            {{ t("profileHome.editProfile") }}
          </RouterLink>
        </div>

        <div class="user-profile-verified g-alert g-warning" v-if="ownProfile && !(user as User).verified">
          <span class="user-profile-verified-text">{{ t("profileHome.emailUnverified") }}</span>
          <a class="g-btn g-btn-sm" :href="verifyUrl" target="_blank">
            {{ t("profileHome.verifyNow") }}
          </a>
        </div>
      </div>
    </div>

    <div class="user-profile-error-container g-glass g-card" v-else>
      <div class="user-profile-error g-alert g-error">{{ errorMessage }}</div>

      <RouterLink to="/" class="g-btn">{{ t("common.goHome.goHome") }}</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-loading {
  align-self: center;
  margin-top: 60px;
  padding: 20px;
  border-radius: var(--g-radius-lg);
}

.user-profile-content {
  display: flex;
  justify-content: center;
}

#profile {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-first-row {
  display: flex;
  flex-direction: row;
  gap: v-bind(profileGap);
  align-items: center;
}

body[mobile] .profile-first-row {
  flex-wrap: wrap;
  justify-content: center;
}

.profile-name {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}

.user-name {
  font-size: 26px;
  font-weight: 700;
}

body[mobile] .user-name {
  font-size: 20px;
}

.user-profile-verified {
  align-items: center;

  &::before {
    margin-top: 0;
  }
}

.user-profile-verified-text {
  flex: 1;
  font-weight: 600;
}

.user-profile-error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  align-self: center;
  margin-top: 40px;
}
</style>
