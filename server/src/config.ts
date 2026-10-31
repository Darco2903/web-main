import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { logger } from "./logger.js";
import { rootPath } from "./utils.js";

dotenv.config({ path: path.join(rootPath, ".env") });

function configError(message: string): never {
    logger.error(message);
    process.exit(1);
}

/** Relative paths are resolved from the root folder, absolute ones are kept */
function resolvePath(p: string) {
    return path.resolve(rootPath, p);
}

function requireEnv(name: string) {
    const value = process.env[name];
    if (!value) {
        configError(`Missing ${name} in environment variables`);
    }
    return value;
}

function requireFile(name: string) {
    const filePath = resolvePath(requireEnv(name));
    if (!fs.existsSync(filePath)) {
        configError(`Invalid ${name} in environment variables: ${filePath} not found`);
    }
    return filePath;
}

/** A URL or a bare host (https:// is assumed), normalized to an origin like https://example.com */
function requireOrigin(name: string) {
    const value = requireEnv(name);
    try {
        return new URL(value.includes("://") ? value : `https://${value}`).origin;
    } catch {
        configError(`Invalid ${name} in environment variables: not a URL`);
    }
}

logger.info("Checking config...");

const listen = requireEnv("SERVER_LISTEN");

const port = Number(process.env.SERVER_PORT);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
    configError("Invalid SERVER_PORT in environment variables");
}

interface SSLConfig {
    keyPath: string;
    certPath: string;
    caPath: string;
}

const ssl: SSLConfig = {
    keyPath: requireFile("SSL_KEY_PATH"),
    certPath: requireFile("SSL_CERT_PATH"),
    caPath: requireFile("SSL_CA_PATH"),
};

const trustProxy = process.env.TRUST_PROXY ?? "false";
if (trustProxy !== "true" && trustProxy !== "false") {
    configError("Invalid TRUST_PROXY in environment variables, expected true or false");
}

const serverOrigin = requireOrigin("SERVER_ORIGIN");
const authServerOrigin = requireOrigin("AUTH_SERVER_ORIGIN");
const cdnServerOrigin = requireOrigin("CDN_SERVER_ORIGIN");
const managerServerOrigin = requireOrigin("MANAGER_SERVER_ORIGIN");
const altvServerOrigin = requireOrigin("ALTV_SERVER_ORIGIN");

logger.info("Config OK");

export const SERVER_LISTEN = listen;
export const SERVER_PORT = port;
export const SSL: SSLConfig = ssl;
export const TRUST_PROXY = trustProxy === "true";

export const SERVER_ORIGIN = serverOrigin;
export const AUTH_SERVER_ORIGIN = authServerOrigin;
export const CDN_SERVER_ORIGIN = cdnServerOrigin;
export const MANAGER_SERVER_ORIGIN = managerServerOrigin;
export const ALTV_SERVER_ORIGIN = altvServerOrigin;
