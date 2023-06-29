const fs = require("fs");
const http = require("http");
const path = require("path");
const { color } = require("console-log-colors");

const SERVER_PATH = "./server";

http.IncomingMessage.prototype.getBody = function () {
    return new Promise((resolve, reject) => {
        let body = "";
        this.on("data", (chunk) => {
            body += chunk.toString();
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

function printLog(...message) {
    const date = new Date(Date.now()).toLocaleString("fr-FR");
    console.log(color.blue(`[${date}]`), message.join(" "));
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
    const url = new URL(req.url, `http://domain.com`);
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
    const file = fs.readFileSync(filePath);
    res.end(file);
}

module.exports = {
    printLog,
    determineContentType,
    GETRequestHandler,
};
