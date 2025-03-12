import { getCallback, socketHandler } from "../utils.js";

export default socketHandler((socket) => {
    socket.on("ping", async (...args) => {
        const callback = getCallback(args);
        callback("pong");
    });
});
