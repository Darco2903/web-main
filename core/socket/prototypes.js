// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const AuthAPI = require("auth-api");

import { Socket } from "socket.io";
// import { logDebug, logError } from "logger";

Socket.prototype.getCookies = function () {
    return Object.fromEntries(
        this.handshake.headers.cookie?.split("; ").map((cookie) => {
            const [key, value] = cookie.split("=");
            return [key, value];
        }) ?? []
    );
};

// Socket.prototype.initUser = async function () {
//     this.user = {};

//     const { session_id } = this.getCookies();
//     if (!session_id) return;

//     this.user.session_id = session_id;

//     // const sessRes = await AuthAPI.user.session(session_id);
//     // if (sessRes.error) {
//     //     logError("Auth:", sessRes.error);
//     // } else if (sessRes.result) {
//     //     this.user.info = sessRes.user;
//     //     // logDebug("Set socket user info");

//     //     const permRes = await AuthAPI.permission(session_id);
//     //     if (permRes.error) {
//     //         logError("Auth:", permRes.error);
//     //     } else if (permRes.result) {
//     //         this.user.level = permRes.level;
//     //         // logDebug("Set socket user level");
//     //     }
//     // }
// };
