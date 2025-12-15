import { err, ok, type Result } from "neverthrow";
import type { User } from "@darco2903/auth-api/client";
import { authApi } from "./index";

export async function getUserInfo(): Promise<Result<User, string>> {
    const res = await authApi.user.me();
    if (res.status === 200) {
        return ok(res.body);
    } else if (res.status === 401) {
        const refreshRes = await refreshAccessToken();
        if (refreshRes.isOk()) {
            return getUserInfo();
        } else {
            return err(refreshRes.error);
        }
    } else if (res.status === 404 || res.status === 500) {
        return err(`Failed to load user: ${res.body.error}`);
    } else {
        return err("Failed to reload user");
    }
}

export async function refreshAccessToken(): Promise<Result<boolean, string>> {
    return authApi
        .refresh({ body: undefined })
        .then((res) => {
            if (res.status === 200) {
                return ok(true);
            } else if (res.status === 400 && res.body.name === "APIError") {
                return err(`Failed to refresh access token: ${res.body.error}`);
            } else if (res.status === 401 || res.status === 500) {
                return err(`Failed to refresh access token: ${res.body.error}`);
            }
            return err("Failed to refresh access token: unknown error");
        })
        .catch((e) => err("Failed to refresh access token"));
}
