import fs from "fs";
import path from "path";
import express from "express";
import { app } from "./app.js";
import { logger } from "../logger.js";
import { IS_PROD, rootPath } from "../utils.js";
import { TRUST_PROXY } from "../config.js";
import { clientConfigPlugin, injectClientConfig } from "./clientConfig.js";
import { getClientIP } from "./utils.js";

export async function registerRoutes() {
    app.use((req, res, next) => {
        const clientIP = getClientIP(req.headers, req.socket.remoteAddress, TRUST_PROXY);
        logger.info(`${req.method.padEnd(6, " ")} ${clientIP} ${req.url}`);
        next();
    });

    const clientPath = path.resolve(rootPath, "client");
    if (!IS_PROD) {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
            root: clientPath,
            // Merged with the plugins of client/vite.config.ts
            plugins: [clientConfigPlugin()],
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.resolve(clientPath, "dist");
        // Read once: the config doesn't change while the server runs
        const indexHtmlContent = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf8");
        const indexHtml = injectClientConfig(indexHtmlContent);

        app.use(express.static(distPath, { index: false }));
        // A file express.static didn't find (an old chunk after a deploy...) is a 404, not the app:
        // the browser would fail to run index.html as a script. App routes never have an extension.
        app.get("*", (req, res, next) => {
            if (path.extname(req.path)) {
                res.sendStatus(404);
                return;
            }
            next();
        });
        app.get("*", (req, res) => {
            res.setHeader("Cache-Control", "no-cache");
            res.type("html").send(indexHtml);
        });
    }
}
