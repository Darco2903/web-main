import path from "path";
import express from "express";

import { fileURLToPath } from "url";
import { app } from "./app.js";
import { logger } from "../logger.js";
import { IS_PROD } from "../utils.js";

app.use((req, res, next) => {
    let clientIP = req.header("CF-Connecting-IP");
    if (!clientIP) {
        clientIP = req.header("X-Forwarded-For")?.split(",")[0];
    }
    logger.info(`${req.method.padEnd(6, " ")} ${clientIP} ${req.url}`);
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientPath = path.join(__dirname, "../../../client");

if (!IS_PROD) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
        root: path.resolve(clientPath),
    });
    app.use(vite.middlewares);
} else {
    const distPath = path.resolve(clientPath, "dist");
    const p = path.resolve(distPath, "index.html");

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
        res.sendFile(p, (err) => {
            if (err) {
                logger.info(err);
                res.status(500).send(err);
            }
        });
    });
}

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
