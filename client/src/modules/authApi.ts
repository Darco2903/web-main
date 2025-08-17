import { initClient } from "@ts-rest/core";
import { contract } from "auth-api";

export const api = initClient(contract, {
    baseUrl: import.meta.env.VITE_AUTH_SERVER_ORIGIN,
    credentials: "include",
});
