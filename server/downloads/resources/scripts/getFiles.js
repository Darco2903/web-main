const fs = require("fs");
const path = require("path");

const { SERVER_PATH } = require("../../../../config.json");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {object} query
 */
async function exec(req, res, query) {
    const p = "/downloads/storage";
    const files = fs.readdirSync(SERVER_PATH + p);
    const filesData = [];
    files.forEach((file) => {
        const filePath = path.join(SERVER_PATH, p, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            filesData.push({
                name: file,
                path: path.join(p, file),
                size: stat.size,
            });
        }
    });
    res.writeHead(200, {
        "Content-Type": "application/json",
    });
    res.write(JSON.stringify(filesData));
}

module.exports = exec;
