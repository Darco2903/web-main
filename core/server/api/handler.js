const path = require("path");

const { printLog, exists } = require("../../utils");

/**
 * @param {string} url
 * @returns {{version: string, endpoint: string}}
 */
function parseUrl(url) {
    // url example: /api/v1/endpoint
    const splited = url.split("/");
    const version = splited[2];
    const endpoint = "/" + splited.slice(3).join("/");
    return { version, endpoint };
}

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 */
async function handleAPIRequest(req, res) {
    const { version, endpoint } = parseUrl(req.url);
    if (!version || !endpoint) {
        res.writeHead(400, "Bad Request");
        res.end("Bad Request");
        return;
    }

    const versionPath = path.join(__dirname, `./${version}/index.js`);
    if (!(await exists(versionPath))) {
        res.writeHead(404, "Not Found");
        res.end("Not Found");
        return;
    }

    // printLog(`API request: version=${version}, endpoint=${endpoint}`);
    try {
        const { handler } = require(versionPath);
        await handler(req, res, endpoint);
    } catch (err) {
        printLog(err);
        res.writeHead(500, "Internal Server Error");
        res.end("Internal Server Error");
    }
}

module.exports = {
    handleAPIRequest,
};
