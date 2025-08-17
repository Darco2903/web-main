import fs from "fs";
import path from "path";
import https from "https";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "../", process.env.SSL_KEY_PATH), "utf8"),
    cert: fs.readFileSync(path.join(__dirname, "../", process.env.SSL_CERT_PATH), "utf8"),
    ca: fs.readFileSync(path.join(__dirname, "../", process.env.SSL_CA_PATH), "utf8"),
};

export const app = express();
export const server = https.createServer(httpsOptions, app);
