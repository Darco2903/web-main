import { colors, logInfo, logError } from "logger";

import { io } from "./index.js";
import { ADDR_PAD } from "../utils.js";

import ping from "./handler/ping.js";

io.use((socket, next) => {
    next();
}).on("connection", (socket) => {
    const socketAddr = socket.handshake.address;
    const socketPath = socket.handshake.query.path;

    logInfo(colors.green("SOCKET"), colors.cyan(socketAddr.padEnd(ADDR_PAD, " ")), colors.green("CONNECTED"), colors.yellow(socketPath));

    socket.once("disconnect", () => {
        logInfo(colors.green("SOCKET"), colors.cyan(socketAddr.padEnd(13, " ")), colors.red("DISCONNECTED"), colors.yellow(socketPath));
    });

    ping(socket);
});
