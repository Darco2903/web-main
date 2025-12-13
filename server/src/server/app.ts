import fs from "fs";
import path from "path";
import https from "https";
import express from "express";
import { fileURLToPath } from "url";
import { SSL_CA_PATH, SSL_CERT_PATH, SSL_KEY_PATH } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpsOptions = {
    key: fs.readFileSync(SSL_KEY_PATH, "utf8"),
    cert: fs.readFileSync(SSL_CERT_PATH, "utf8"),
    ca: fs.readFileSync(SSL_CA_PATH, "utf8"),
};

export const app = express();
export const server = https.createServer(httpsOptions, app);
