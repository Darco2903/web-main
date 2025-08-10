import fs from "fs";
import path from "path";
import https from "https";
import express from "express";
import { fileURLToPath } from "url";

import config from "../../config/express.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "../", config.ssl.key), "utf8"),
    cert: fs.readFileSync(path.join(__dirname, "../", config.ssl.cert), "utf8"),
    ca: fs.readFileSync(path.join(__dirname, "../", config.ssl.ca), "utf8"),
};

export const app = express();
export const server = https.createServer(httpsOptions, app);
