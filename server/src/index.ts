import "./loadEnv.js";
import { IS_PROD } from "./utils.js";
import { startServer, stopServer } from "./server/index.js";
import { logger } from "./logger.js";

let stop = false;

async function exit() {
    if (!stop) {
        stop = true;
        logger.info("Stopping server...");
        await stopServer();
        logger.info("Server stopped");
        process.exit(0);
    }
}

process.on("SIGINT", exit);
process.on("SIGTERM", exit);

(async () => {
    logger.info("Starting server...");
    await startServer();
    logger.info(`Started in ${IS_PROD ? "production" : "development"} mode`);
})();
