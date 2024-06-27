const { db } = require("../../../../../database/index");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 */
async function getDownloads(req, res) {
    const downloads = await db.find("downloads");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(downloads));
}

module.exports = getDownloads;
