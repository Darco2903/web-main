import { colors, logDebug, logInfo } from "logger";

import { IS_PROD } from "./core/utils.js";
import { startServer, stopServer } from "./core/server/index.js";
import { stopSocket } from "./core/socket/index.js";
import "./core/server/handler.js";
import "./core/socket/handler.js";

// import { db } from "./database/index.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { origin } = require("./config/express.json");

const AuthAPI = require("auth-api");
AuthAPI.setApiOrigin(origin);

let stop = false;

process.on("SIGINT", async (signal) => {
    if (!stop) {
        stop = true;
        logInfo(colors.magenta("Stopping server..."));
        stopSocket();
        await await stopServer();
        logInfo(colors.green("Server stopped"));
        // await db.disconnect();
        // logInfo(colors.green("Database disconnected"));
        process.exit(0);
    }
});

(async () => {
    logInfo(colors.magenta("Starting server..."));

    // await db.connect().catch((err) => {
    //     logInfo(colors.red("Database connection failed"), err);
    //     logDebug(err);
    //     process.exit(1);
    // });
    // logInfo(colors.green("Database connected"));

    await startServer();
    logInfo(`Started in ${IS_PROD ? colors.green("production") : colors.yellow("development")} mode`);
})();
