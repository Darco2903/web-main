import { Server as ioServer } from "socket.io";
import "./prototypes.js";

import { server } from "../server/index.js";
import { logError, logInfo } from "logger";

export const io = new ioServer(server, {
    // cors: {
    //     origin: "https://dev-www.darco2903.fr",
    //     // origin: "http://localhost:8080",
    // },
    maxHttpBufferSize: 2 * 1e6, // 2MB
    // pingTimeout: 60000,
});

export async function stopSocket() {
    // return new Promise((resolve, reject) => {});
    io.local.disconnectSockets(true);
}
