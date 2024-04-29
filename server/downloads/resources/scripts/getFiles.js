const fs = require("fs");
const path = require("path");

const { SERVER_PATH } = require("../../../../config/server.json");
const { PATH: DOWNLOAD_PATH } = require("../../../../config/download.json");

const downloadPath = path.join(SERVER_PATH, DOWNLOAD_PATH);

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {object} query
 */
async function exec(req, res, query) {
    const files = await fs.promises.readdir(downloadPath);
    const promises = files
        .map(async (file) => {
            const filePath = path.join(downloadPath, file);
            const stat = await fs.promises.stat(filePath);
            if (stat.isFile()) {
                return {
                    name: file,
                    path: path.join(DOWNLOAD_PATH, file),
                    size: stat.size,
                };
            }
        })
        .filter((file) => file);

    const filesData = await Promise.all(promises);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(filesData));
}

module.exports = exec;
