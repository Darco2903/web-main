import { logger } from "../logger.js";
import { SERVER_LISTEN, SERVER_PORT } from "../config.js";
import { server } from "./app.js";
import "./prototypes.js";
import "./handler.js";

export async function startServer() {
    await new Promise<void>((resolve) => {
        server.listen(SERVER_PORT, SERVER_LISTEN, () => {
            logger.info(`Server listening ${SERVER_LISTEN}:${SERVER_PORT}`);
            resolve();
        });
    });
}

export async function stopServer() {
    await new Promise<void>((resolve, reject) => {
        server.close((err) => {
            if (err) {
                logger.error(`Error stopping server: ${err.message}`);
                reject(err);
            } else {
                logger.info("Server stopped");
                resolve();
            }
        });
        server.closeAllConnections();
    });
}
