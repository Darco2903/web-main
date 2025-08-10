import { logger } from "../logger.js";
import { server } from "./app.js";
import "./prototypes.js";
import "./handler.js"

import config from "../../config/express.json" with { type: "json" };

export async function startServer() {
    await new Promise<void>((resolve) => {
        server.listen(config.port, config.host, () => {
            logger.info(`Server listening ${config.host}:${config.port}`);
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
