import path from "path";
import express from "express";
// import pinoHttp from "pino-http";
import { app } from "./app.js";
import { logger } from "../logger.js";
import { IS_PROD } from "../utils.js";

// app.use(
//     pinoHttp({
//         logger,
//         autoLogging: false,
//         customSuccessMessage: function (req, res) {
//             return `${req.method} ${req.url} ${res.statusCode}`;
//         },
//         customErrorMessage: function (req, res, err) {
//             return `${req.method} ${req.url} ${res.statusCode} - Error: ${err.message}`;
//         },
//         customLogLevel: (req, res, err) => {
//             if (res.statusCode >= 500) return "error";
//             if (res.statusCode >= 400) return "warn";
//             return "info";
//         },
//     })
// );

app.use((req, res, next) => {
    let clientIP = req.header("CF-Connecting-IP");
    if (!clientIP) {
        clientIP = req.header("X-Forwarded-For")?.split(",")[0];
    }
    logger.info(`${req.method.padEnd(6, " ")} ${clientIP} ${req.url}`);
    next();
});

if (!IS_PROD) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
        root: path.resolve("../client"),
    });
    app.use(vite.middlewares);
} else {
    const distPath = path.resolve("../client/dist");
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
