const fs = require("fs");
const http = require("http");
const path = require("path");
const formidable = require("formidable");
const AuthAPI = require("auth-api");

const proxy = require("./utils/proxy.js");
const { colors, setDebugMode, setDevMode, logInfo, logDebug } = require("logger");

const { SERVER_PATH } = require("./config/server.json");
const restrictedPath = require("./config/restrictedPath.json");

const args = process.argv.slice(2);
const DEBUG = args.includes("--debug");
const DEV_MODE = args.includes("--dev");

setDebugMode(DEBUG);
setDevMode(DEV_MODE);

const AUTH_CACHE_TIMEOUT = 1000;
const authCache = new Map();

const PERMISSION_CACHE_TIMEOUT = 1000;
const permissionCache = new Map();

http.IncomingMessage.prototype.getBody = async function () {
    return new Promise((resolve, reject) => {
        let body = "";
        this.on("data", (chunk) => (body += chunk));
        this.on("end", () => resolve(body));
        this.on("error", (error) => reject(error));
    });
};

http.IncomingMessage.prototype.getCookies = function () {
    return Object.fromEntries(
        this.headers?.cookie?.split("; ").map((cookie) => {
            const [key, value] = cookie.split("=");
            return [key, value];
        }) ?? []
    );
};

async function printObject(obj) {
    await logInfo(colors.yellow("Object:"));
    const entries = Object.entries(obj);
    for (const [key, value] of entries) {
        if (key === "files") {
            if (value) value = value.map((file) => file.originalFilename);
            else return;
        }
        value = JSON.stringify(value);
        if (value.length > 100) value = value.slice(0, 100) + "...";
        await logInfo(`${colors.blue("-".repeat(21))} ${colors.cyan(key)} : ${colors.magenta(value)}`);
    }
}

function getHost(req) {
    return req.headers.host;
}

function getDomain(host) {
    const removePort = host.split(":")[0];
    const domain = removePort.split(".").slice(-2).join(".");
    return domain;
}

function isIp(host) {
    const removePort = host.split(":")[0];
    const split = removePort.split(".");
    return (
        split.length === 4 &&
        split.every((part) => {
            if (isNaN(part)) return false;
            const num = parseInt(part);
            return num >= 0 && num <= 255;
        })
    );
}

function createCookie(name, value, { path, domain, maxAge, expires, secure, samesite, httpOnly }) {
    let cookie = `${name}=${value}`;
    if (path) cookie += `;path=${path}`;
    if (domain) cookie += `;domain=${domain}`;
    if (maxAge) cookie += `;max-age=${maxAge}`;
    if (expires) cookie += `;expires=${expires.toUTCString()}`;
    if (secure) cookie += `;secure`;
    if (samesite) cookie += `;samesite=${samesite}`;
    if (httpOnly) cookie += `;HttpOnly`;
    return cookie;
}

async function exists(filePath) {
    return fs.promises
        .access(filePath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}

function determineContentType(filePath) {
    const extension = path.extname(filePath).slice(1);
    switch (extension) {
        case "html":
            return "text/html";
        case "css":
            return "text/css";
        case "js":
            return "application/javascript";
        case "json":
            return "application/json";
        case "xml":
            return "application/xml";
        case "jpeg":
        case "jpg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "gif":
            return "image/gif";
        case "svg":
            return "image/svg+xml";
        case "pdf":
            return "application/pdf";
        case "txt":
            return "text/plain";
        case "csv":
            return "text/csv";
        case "xls":
            return "application/vnd.ms-excel";
        case "xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        case "doc":
            return "application/msword";
        case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "ppt":
            return "application/vnd.ms-powerpoint";
        case "pptx":
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        case "zip":
            return "application/zip";
        case "mp3":
            return "audio/mpeg";
        case "wav":
            return "audio/wav";
        case "mp4":
            return "video/mp4";
        case "avi":
            return "video/x-msvideo";
        default:
            return "application/octet-stream";
    }
}

/**
 * @param {string} url
 * @returns {{ pathname: string, search: string }}
 */
function urlParse(url) {
    const [pathname, search] = url.split("?");
    return { pathname, search };
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @returns {Promise<void>}
 */
async function proxyRequest(req, res) {
    const url = proxy.parseUrl(req);
    if (!proxy.enabled) {
        printLog(colors.red("Proxy disabled"), colors.cyan(url));
        res.writeHead(503, "Service Unavailable");
    } else if (proxy.isAllowed(url)) {
        printLog(colors.green("Proxy to"), colors.cyan(url));
        await proxy.proxy(req, res, url).catch((error) => {
            printLog(colors.red("Error proxying to"), colors.cyan(url));
            printDebug(error);
            res.writeHead(502, "Bad Gateway");
        });
    } else {
        printLog(colors.red("Unauthorized access to"), colors.cyan(url));
        res.writeHead(403, "Forbidden");
    }
    res.end();
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function GETRequestHandler(req, res) {
    if (proxy.configOk && proxy.isRequest(req)) return proxyRequest(req, res);

    const url = urlParse(req.url);
    let filePath = path.join(SERVER_PATH, decodeURIComponent(url.pathname));

    if (filePath.endsWith("/") || filePath.endsWith("\\")) {
        filePath += "index";
    }

    if (!(await exists(filePath))) {
        if (!path.extname(filePath) && !filePath.endsWith(".")) {
            filePath += ".html";
        }

        if (!(await exists(filePath))) {
            res.writeHead(404, "Not Found");
            res.end();
            return;
        }
    }

    const stats = await fs.promises.stat(filePath);
    const fileSize = stats.size;
    // const cache = !(DEV_MODE || req.headers.host.includes("127.0.0.1"));
    res.setHeader("Content-Type", determineContentType(filePath));
    res.setHeader("Content-Length", fileSize);
    // res.setHeader("Cache-Control", cache ? "public, max-age=600" : "no-cache, no-store, must-revalidate");
    // cache but check for updates
    // res.setHeader("Cache-Control", cache ? "public, max-age=600, must-revalidate" : "no-cache, no-store, must-revalidate");
    // res.end(file);

    if (fileSize < 1024 * 1024) {
        const data = await fs.promises.readFile(filePath);
        res.writeHead(200, "OK");
        res.end(data);
    } else {
        await new Promise((resolve, reject) => {
            const stream = fs
                .createReadStream(filePath)
                .on("open", () => {
                    res.writeHead(200, "OK");
                    stream.pipe(res);
                })
                .on("end", () => {
                    res.end();
                    resolve();
                })
                .on("error", (error) => {
                    res.end();
                    reject(error);
                });
            res.on("close", () => {
                stream.close();
            });
        });
    }
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @returns {Promise<void>}
 */
async function POSTRequestHandler(req, res) {
    const path = SERVER_PATH + req.url;
    const form = new formidable.IncomingForm();
    const [fields, files] = await form.parse(req);
    const entries = Object.entries(fields)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => (value.length === 1 ? [key, value[0]] : [key, value]));
    const query = Object.fromEntries(entries);
    const keys = Array.from(Object.keys(fields));
    keys.filter((item, index) => keys.indexOf(item) !== index).forEach((key) => {
        query[key] = params.getAll(key);
    });
    query.files = files.file;
    if (keys.length !== 0) printObject(query);
    const exec = require(path);
    const response = await exec(req, res, query);
    if (!res.closed) res.end(response);
    return Promise.resolve();
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @returns {Promise<void>}
 */
async function HEADRequestHandler(req, res) {
    const url = new URL(req.url, "http://host.com");
    let filePath = path.join(SERVER_PATH, decodeURIComponent(url.pathname));

    if (filePath.endsWith("/") || filePath.endsWith("\\")) {
        filePath += "index";
    }

    if (!path.extname(filePath) && !filePath.endsWith(".")) {
        filePath += ".html";
    }

    if (!(await exists(filePath))) {
        res.writeHead(404, "Not Found");
        res.end();
        return;
    }

    const stats = await fs.promises.stat(filePath);
    res.setHeader("Content-Type", determineContentType(filePath));
    res.setHeader("Content-Length", stats.size);
    res.end();
}

function getPathPermission(reqPath) {
    return Object.keys(restrictedPath)
        .filter((path) => reqPath.startsWith(path))
        .map((path) => restrictedPath[path])
        .reduce((highest, current) => (current > highest ? current : highest), 0);
}

function cacheAuth(sessionId, isAuth) {
    // console.log("Caching auth", sessionId, isAuth);
    authCache.set(sessionId, isAuth);
    setTimeout(() => authCache.delete(sessionId), AUTH_CACHE_TIMEOUT);
}

/**
 * @param {http.IncomingMessage} req
 */
async function isAuthenticated(req) {
    const { session_id } = req.getCookies();
    // console.log("Session ID", session_id);
    if (!session_id) return false;
    if (authCache.has(session_id)) {
        // console.log("Using cached auth", session_id);
        return authCache.get(session_id);
    }
    const { result, error } = await AuthAPI.auth(session_id);
    cacheAuth(session_id, result);
    return result;
}

function cachePermissionKey(sessionId, level) {
    return `${sessionId}-${level}`;
}

function cachePermission(sessionId, level, hasPerm) {
    // console.log("Caching permission", sessionId, level, hasPerm);
    permissionCache.set(`${sessionId}-${level}`, hasPerm);
    setTimeout(() => permissionCache.delete(`${sessionId}-${level}`), PERMISSION_CACHE_TIMEOUT);
}

/**
 * @param {http.IncomingMessage} req
 * @param {number} level
 */
async function hasPermission(req, level) {
    const { session_id } = req.getCookies();
    if (!session_id) return false;
    const permKey = cachePermissionKey(session_id, level);
    if (permissionCache.has(permKey)) {
        // console.log("Using cached permission", session_id, level);
        return permissionCache.get(permKey);
    }

    // console.log(session_id, level);
    const { result, error } = await AuthAPI.hasPermission(session_id, level);
    // console.log(result);
    cachePermission(session_id, level, result);
    return result;
}

module.exports = {
    DEBUG,
    DEV_MODE,
    printLog: logInfo,
    printDebug: DEBUG ? logDebug : () => {},
    printObject,
    getHost,
    getDomain,
    isIp,
    createCookie,
    exists,
    GETRequestHandler,
    POSTRequestHandler,
    HEADRequestHandler,
    getPathPermission,
    hasPermission,
    isAuthenticated,
};
