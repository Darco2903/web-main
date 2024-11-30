const fs = require("fs");
const path = require("path");
const { exists } = require("../../utils");

const { SERVER_PATH } = require("../../../config/server.json");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
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

    const size = (await fs.promises.stat(filePath)).size;
    res.setHeader("Content-Type", determineContentType(filePath));
    res.setHeader("Content-Length", size);
    res.end();
}

module.exports = HEADRequestHandler;
