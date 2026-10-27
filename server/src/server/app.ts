import fs from "fs";
import https from "https";
import express from "express";
import { SSL } from "../config.js";

const httpsOptions = {
    key: fs.readFileSync(SSL.keyPath, "utf8"),
    cert: fs.readFileSync(SSL.certPath, "utf8"),
    ca: fs.readFileSync(SSL.caPath, "utf8"),
};

export const app = express();
export const server = https.createServer(httpsOptions, app);
