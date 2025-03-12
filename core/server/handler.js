import path from "path";
import express from "express";
import { colors, logInfo } from "logger";

import { app } from "./index.js";
import { ADDR_PAD, IS_PROD } from "../utils.js";

import v1Router from "./v1/routes.js";

app.use((req, res, next) => {
    let clientIP = req.header("CF-Connecting-IP");
    if (!clientIP) {
        clientIP = req.header("X-Forwarded-For")?.split(",").at(0);
    }
    logInfo(`${colors.green(req.method.padEnd(6, " "))} ${colors.cyan(clientIP.padEnd(ADDR_PAD, " "))} ${colors.yellow(req.url)}`);
    next();
});

if (!IS_PROD) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer();
    app.use(vite.middlewares);
} else {
    const distPath = path.resolve("dist");
    const p = path.resolve(distPath, "index.html");

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
        res.sendFile(p, (err) => {
            if (err) {
                logInfo(err);
                res.status(500).send(err);
            }
        });
    });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", v1Router);
