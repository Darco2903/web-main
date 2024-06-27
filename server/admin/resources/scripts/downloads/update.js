const { db } = require("../../../../../database/index");

function sendError(res, code, message) {
    res.writeHead(code, { "Content-Type": "text/plain" });
    res.end(message);
}

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {object} query
 * @param {string} query.name
 * @param {number} query.level
 */
async function update(req, res, { id, name, level }) {
    if (!id) {
        sendError(res, 400, "NO_ID");
        return;
    }

    if (!name) {
        sendError(res, 400, "NO_NAME");
        return;
    }

    if (isNaN(level)) {
        sendError(res, 400, "NO_LEVEL");
        return;
    }

    try {
        await db.update("downloads", { id }, { name, level });
        res.setHeader("Content-Type", "text/plain");
        res.end("success");
    } catch (error) {
        console.error("Error", error.message);
        sendError(res, 500, "UPDATE_FAILED");
    }
}

module.exports = update;
