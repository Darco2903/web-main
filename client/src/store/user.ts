import { defineStore } from "pinia";
import { accessTokenExpiresAt, type User } from "@darco2903/auth-api/client";
import { getUserInfo, refreshAccessToken } from "@api/user";

export const useStore = defineStore("user", {
    state: () => ({
        info: null as User | null,
        refreshTimeoutId: null as number | null,
    }),
    actions: {
        async init(): Promise<boolean> {
            const res = await getUserInfo();
            console.log("getUserInfo result:", res);
            if (res.isOk()) {
                this.info = res.value;
                this.autoRefresh();
            } else {
                this.info = null;
            }
            return res.isOk();
        },
        autoRefresh() {
            const expiresAt = accessTokenExpiresAt();
            console.log(`User info loaded. Access token expires at ${expiresAt}`);

            if (expiresAt) {
                const expiresIn = expiresAt.getTime() - Date.now();
                const refreshIn = Math.max(0, expiresIn - 5 * 60000); // Refresh 5 minute before expiry
                console.log(`Scheduling access token refresh in ${refreshIn / 1000} seconds.`);

                if (this.refreshTimeoutId) {
                    clearTimeout(this.refreshTimeoutId);
                }

                this.refreshTimeoutId = setTimeout(async () => {
                    this.refreshTimeoutId = null;

                    console.log("Access token expired, refreshing...");

                    const res = await refreshAccessToken();
                    if (res.isOk()) {
                        console.log("Access token refreshed successfully.");
                        this.autoRefresh();
                    } else {
                        console.error("Failed to refresh access token:", res.error);
                    }
                }, refreshIn);
            }
        },
        getPublicId(): string | null {
            return this.info ? this.info.public_id : null;
        },
        getUserIconUrl(): string | undefined {
            return this.info?.assets.avatar || undefined;
        },
    },
});
