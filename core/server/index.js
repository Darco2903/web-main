import fs from "fs";
import https from "https";
import express from "express";
import { colors, logError, logInfo } from "logger";

import "./utils.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { host, port, localPort, ssl } = require("../../config/express.json");

const httpsOptions = {
    key: fs.readFileSync(ssl.key, "utf8"),
    cert: fs.readFileSync(ssl.cert, "utf8"),
    ca: fs.readFileSync(ssl.ca, "utf8"),
};

export const app = express();
export const server = https.createServer(httpsOptions, app);

export async function startServer() {
    await new Promise((resolve, reject) => {
        server.listen(port, host, () => {
            logInfo(`Server listening ${colors.green(host)}:${colors.yellow(port)}`);
            resolve();
        });
    });
}

export async function stopServer() {
    await new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) {
                logError("Error stopping server", err);
                reject(err);
            } else {
                logInfo("Server stopped");
                resolve();
            }
        });
        server.closeAllConnections();
    });
}
