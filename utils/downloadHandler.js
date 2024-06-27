const fs = require("fs");
const path = require("path");

const { db } = require("../database/index");
const utils = require("../utils");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 */
async function handler(req, res) {
    const id = req.url.split("/").pop();
    // console.log("Download id", id);

    const download = await db.findOne("downloads", { where: { id } });
    // console.log("Download", download);
    if (!download) {
        res.statusCode = 404;
        res.end("Not found");
        return;
    }

    // check perms
    const authorized = await utils.hasPermission(req, download.level);
    // console.log("Authorized", authorized);
    if (!authorized) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
    }

    const filePath = path.join(".", download.path);
    // console.log("File path", filePath);
    const exists = await utils.exists(filePath);
    // console.log("File exists", exists);

    if (!exists) {
        res.statusCode = 404;
        res.end("Not found");
        return;
    }

    const fileSize = download.size;
    const range = req.headers.range;
    // console.log("Range", range);

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

module.exports = handler;
