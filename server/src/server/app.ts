import fs from "fs";
import https from "https";
import express from "express";

import config from "../../config/express.json" with { type: "json" };

const httpsOptions = {
    key: fs.readFileSync(config.ssl.key, "utf8"),
    cert: fs.readFileSync(config.ssl.cert, "utf8"),
    ca: fs.readFileSync(config.ssl.ca, "utf8"),
};

export const app = express();
export const server = https.createServer(httpsOptions, app);
