const fs = require("fs");
const { logDebug } = require("logger");

const { exists } = require("../../../../utils");
const { hasPermission } = require("../../../utils");
const { db } = require("../../../../../database/index");

function sendError(res, code, message) {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
}

async function findDownload(id) {
    return db.findOne("downloads", { where: { id } });
}

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {string} id
 */
async function GET(req, res, id) {
    const download = await findDownload(id);
    if (!download) {
        sendError(res, 404, "Not found");
        return;
    }

    const authorized = await hasPermission(req, download.level);
    if (!authorized) {
        sendError(res, 403, "Forbidden");
        return;
    }

    const filePath = download.path;
    const fileExists = await exists(filePath);
    logDebug("File exists", fileExists, filePath);

    if (!fileExists) {
        sendError(res, 404, "Not found");
        return;
    }

    const fileSize = download.size;
    const range = req.headers.range;

    if (range && false) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
            "Content-Type": "application/octet-stream",
            "Content-Length": chunksize,
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
        });
        file.pipe(res);
    } else {
        res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Length": fileSize,
            "Content-Disposition": `attachment; filename="${download.name}"`,
        });
        fs.createReadStream(filePath).pipe(res);
    }
}

module.exports = {
    GET,
};
