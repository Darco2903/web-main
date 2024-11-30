const { Socket } = require("socket.io");

Socket.prototype.getCookies = function () {
    return Object.fromEntries(
        this.handshake.headers.cookie?.split("; ").map((cookie) => {
            const [key, value] = cookie.split("=");
            return [key, value];
        }) ?? []
    );
};
