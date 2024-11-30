const fs = require("fs");
const path = require("path");

const { SERVER_PATH } = require("../../../config/server.json");
const { exists } = require("../../utils");

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
 * @param {string} url
 * @returns {{ pathname: string, search: string }}
 */
function urlParse(url) {
    const [pathname, search] = url.split("?");
    return { pathname, search };
}

/**
 * @param {import("http").ServerResponse} res
 * @param {string} filePath
 * @returns {Promise<void>}
 */
async function streamResponse(res, filePath) {
    return new Promise((resolve, reject) => {
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

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @returns {Promise<void>}
 */
async function GETRequestHandler(req, res) {
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

    res.setHeader("Content-Type", determineContentType(filePath));
    res.setHeader("Content-Length", fileSize);
    res.setHeader("Accept-Ranges", "bytes");

    if (fileSize < 1024 * 1024) {
        const data = await fs.promises.readFile(filePath);
        res.writeHead(200, "OK");
        res.end(data);
    } else {
        await streamResponse(res, filePath);
    }
}

module.exports = GETRequestHandler;
