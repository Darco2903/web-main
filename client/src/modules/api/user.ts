import { err, ok, ResultAsync } from "neverthrow";
import type { User } from "@darco2903/auth-api/client";
import { authApi } from "./index";

export function getUserInfo(refresh: boolean = true): ResultAsync<User, string> {
    return ResultAsync.fromPromise(
        authApi.user.me(),
        (e) => "Failed to fetch user info: " + (e instanceof Error ? e.message : String(e)),
    ).andThen((res) => {
        if (res.status === 200) {
            return ok(res.body);
        } else if (res.status === 401) {
            if (refresh) {
                return refreshAccessToken().andThen((refreshed) => {
                    if (refreshed) {
                        return getUserInfo(false); // Retry once after refreshing token
                    } else {
                        return err("Unauthorized: Access token may have expired. Please log in again.");
                    }
                });
            } else {
                return err("Unauthorized: Access token may have expired. Please log in again.");
            }
        } else if (res.status === 404 || res.status === 500) {
            return err(`Failed to load user: ${res.body.error}`);
        } else {
            return err("Failed to reload user");
        }
    });
}

export function refreshAccessToken(): ResultAsync<boolean, string> {
    return ResultAsync.fromPromise(
        authApi.refresh({ body: undefined }),
        (e) => "Failed to refresh access token: " + (e instanceof Error ? e.message : String(e)),
    ).andThen((res) => {
        if (res.status === 200) {
            return ok(true);
        } else if (res.status === 400 && res.body.name === "APIError") {
            return err(`Failed to refresh access token: ${res.body.error}`);
        } else if (res.status === 401 || res.status === 500) {
            return err(`Failed to refresh access token: ${res.body.error}`);
        }
        return err("Failed to refresh access token: unknown error");
    });
}
