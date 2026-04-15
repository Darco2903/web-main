import { defineStore } from "pinia";
import type { ResultAsync } from "neverthrow";
import { accessTokenExpiresAt, type User } from "@darco2903/auth-api/client";
import { getUserInfo, refreshAccessToken } from "@api/user";

export const useStore = defineStore("user", {
    state: () => ({
        info: null as User | null,
        refreshTimeoutId: null as number | null,
        refreshTimestamp: 0,
    }),
    actions: {
        refresh(): ResultAsync<User, string> {
            return getUserInfo()
                .andTee((res) => {
                    this.info = res;
                    this.refreshTimestamp = Date.now();
                })
                .orTee((e) => {
                    this.info = null;
                });
        },
        async init(): Promise<boolean> {
            return this.refresh()
                .andTee(() => {
                    this.autoSessionRefresh();
                })
                .match(
                    () => true,
                    () => false,
                );
        },
        autoSessionRefresh() {
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
                        this.autoSessionRefresh();
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
        getUserIconUrlNoCache(): string | undefined {
            const url = this.getUserIconUrl();
            if (url) {
                return `${url}?t=${this.refreshTimestamp}`;
            }
            return undefined;
        },
    },
});
