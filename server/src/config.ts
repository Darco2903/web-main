import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { logger } from "./logger.js";
import { rootPath } from "./utils.js";

dotenv.config();

function configError(message: string) {
    logger.error(message);
    process.exit(1);
}

logger.info("Checking config...");

if (!process.env.SERVER_LISTEN) {
    configError("Missing SERVER_LISTEN in environment variables");
}

const port = parseInt(process.env.SERVER_PORT);
if (isNaN(port) || port < 0 || port > 65535) {
    configError("Invalid SERVER_PORT in environment variables");
}

const sslKeyPath = path.join(rootPath, process.env.SSL_KEY_PATH);
if (!fs.existsSync(sslKeyPath)) {
    configError("Invalid SSL_KEY_PATH in environment variables");
}

const sslCertPath = path.join(rootPath, process.env.SSL_CERT_PATH);
if (!fs.existsSync(sslCertPath)) {
    configError("Invalid SSL_CERT_PATH in environment variables");
}

const sslCaPath = path.join(rootPath, process.env.SSL_CA_PATH);
if (!fs.existsSync(sslCaPath)) {
    configError("Invalid SSL_CA_PATH in environment variables");
}

if (!process.env.DOMAIN) {
    configError("Missing DOMAIN in environment variables");
}

if (!process.env.SERVER_ORIGIN) {
    configError("Missing SERVER_ORIGIN in environment variables");
}

if (!process.env.AUTH_SERVER_ORIGIN) {
    configError("Missing AUTH_SERVER_ORIGIN in environment variables");
}

logger.info("Config OK");

export const SERVER_LISTEN = process.env.SERVER_LISTEN;
export const SERVER_PORT = port;
export const SSL_KEY_PATH = sslKeyPath;
export const SSL_CERT_PATH = sslCertPath;
export const SSL_CA_PATH = sslCaPath;

export const DOMAIN = process.env.DOMAIN;
export const SERVER_ORIGIN = process.env.SERVER_ORIGIN;
export const AUTH_SERVER_ORIGIN = process.env.AUTH_SERVER_ORIGIN;
