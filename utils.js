const fs = require("fs");
const http = require("http");
const path = require("path");
const formidable = require("formidable");
const { color } = require("console-log-colors");

const { SERVER_PATH } = require("./config.json");

const args = process.argv.slice(2);
const DEBUG = args.includes("--debug");
const DEV_MODE = args.includes("--dev");
const AUTH_SERVER_ERROR = new Error("Auth server not found");
AUTH_SERVER_ERROR.code = "AUTH_SERVER_ERROR";
AUTH_SERVER_ERROR.message = "Auth server is not reachable";

http.IncomingMessage.prototype.getBody = function () {
    return new Promise((resolve, reject) => {
        let body = "";
        this.on("data", (chunk) => {
            body += chunk;
        });
        this.on("end", () => {
            resolve(body);
        });
        this.on("error", (error) => {
            reject(error);
        });
    });
};

http.IncomingMessage.prototype.getCookies = function () {
    return Object.fromEntries(
        this.headers.cookie?.split("; ").map((cookie) => {
            const [key, value] = cookie.split("=");
            return [key, value];
        }) ?? []
    );
};

function printDebug(...message) {
    message.unshift(color.yellow("[DEBUG]"));
    printLog(...message);
}

function printLog(...message) {
    const date = new Date(Date.now()).toLocaleString("fr-FR");
    console.log(color.blue(`[${date}]`), message.join(" "));
}

function printObject(obj) {
    printLog(color.yellow("Object:"));
    Object.entries(obj).forEach(([key, value]) => {
        if (key === "files") {
            if (value) value = value.map((file) => file.originalFilename);
            else return;
        }
        console.log(`${color.blue("-".repeat(21))} ${color.cyan(key)} : ${color.magenta(JSON.stringify(value))}`);
    });
}

function getPathPermission(reqPath) {
    return Object.keys(restrictedPath)
        .filter((path) => reqPath.startsWith(path))
        .map((path) => restrictedPath[path])
        .reduce((highest, current) => (current > highest ? current : highest), 0);
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
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function GETRequestHandler(req, res) {
    const url = new URL(req.url, "http://host.com");
    let filePath = path.join(SERVER_PATH, decodeURIComponent(url.pathname));

    if (filePath.endsWith("/") || filePath.endsWith("\\")) {
        filePath += "index";
    }

    if (!path.extname(filePath) && !filePath.endsWith(".")) {
        filePath += ".html";
    }

    if (!fs.existsSync(filePath)) {
        res.writeHead(404, "Not Found");
        res.end();
        return;
    }

    const file = fs.readFileSync(filePath);
    const cache = !(DEV_MODE || req.headers.host.includes("127.0.0.1"));
    res.setHeader("Content-Type", determineContentType(filePath));
    res.setHeader("Cache-Control", cache ? "public, max-age=600" : "no-cache, no-store, must-revalidate");
    res.end(file);
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
function HEADRequestHandler(req, res) {
    const url = new URL(req.url, "http://host.com");
    let filePath = path.join(SERVER_PATH, decodeURIComponent(url.pathname));

    if (filePath.endsWith("/") || filePath.endsWith("\\")) {
        filePath += "index";
    }

    if (!path.extname(filePath) && !filePath.endsWith(".")) {
        filePath += ".html";
    }

    if (!fs.existsSync(filePath)) {
        res.writeHead(404, "Not Found");
        res.end();
        return;
    }
    res.setHeader("Content-Type", determineContentType(filePath));
    res.setHeader("Content-Length", fs.statSync(filePath).size);
    res.end();
}

async function isAuthenticated(req) {
    try {
        const response = await fetch(`http://${authServer}/auth/auth.js`, {
            method: "POST",
            headers: {
                Cookie: req.headers["cookie"],
            },
        });
        return response.status === 200;
    } catch (error) {
        throw AUTH_SERVER_ERROR;
    }
}

async function hasPermission(req, role) {
    try {
        const response = await fetch(`http://${authServer}/auth/perm.js`, {
            method: "POST",
            headers: {
                Cookie: req.headers["cookie"],
            },
            body: new URLSearchParams({ role }),
        });
        return response.status === 200;
    } catch (error) {
        throw AUTH_SERVER_ERROR;
    }
}

Array.prototype.shuffle = function () {
    const arr = Array.from(this);
    let currentIndex = arr.length;
    let randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }
    return arr;
};

module.exports = {
    DEBUG,
    DEV_MODE,
    printDebug: DEBUG ? printDebug : () => {},
    printLog,
    printObject,
    determineContentType,
    GETRequestHandler,
    POSTRequestHandler,
    HEADRequestHandler,
};
