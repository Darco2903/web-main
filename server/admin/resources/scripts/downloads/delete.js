const fs = require("fs");

const { db } = require("../../../../../database/index");
const { exists, printLog } = require("../../../../../utils");

function sendError(res, code, message) {
    res.writeHead(code, { "Content-Type": "text/plain" });
    res.end(message);
}

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {object} query
 * @param {string} query.id
 */
async function deleteDL(req, res, { id }) {
    if (!id) {
        sendError(res, 400, "NO_ID");
        return;
    }

    const download = await db.findOne("downloads", { where: { id } });
    if (!download) {
        sendError(res, 404, "DOWNLOAD_NOT_FOUND");
        return;
    }
    // console.log("Deleting", await exists(download.path), download.path);
    try {
        if (await exists(download.path)) await fs.promises.unlink(download.path);
        else printLog("File not found", download.path);
        await db.delete("downloads", { id });
        printLog("Deleted", download.id, download.path);
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("success");
    } catch (error) {
        console.error("Error", error.message);
        sendError(res, 500, "DELETE_FAILED");
    }
}

module.exports = deleteDL;
