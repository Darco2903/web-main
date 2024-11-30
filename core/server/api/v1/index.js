const { logDebug } = require("logger");

const download = require("./endpoints/download");

/**
 * @param {string|string[]} fullEndpoint
 * @returns {{endpoint: string, params: string[]}}
 */
function parseEndpoint(fullEndpoint) {
    const splited = Array.isArray(fullEndpoint) ? fullEndpoint : fullEndpoint.split("/").filter((x) => x);
    return ["/" + splited.shift(), splited];
}

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {string} endpoint
 */
async function GET(req, res, fullEndpoint) {
    logDebug(`GET ${fullEndpoint}`);
    let [endpoint, params] = parseEndpoint(fullEndpoint);
    logDebug("endpoint", endpoint);
    logDebug("params", params);

    switch (endpoint) {
        case "/download":
            // [endpoint, params] = parseEndpoint(params);
            // logDebug("endpoint", endpoint);
            // logDebug("params", params);
            download.GET(req, res, params);
            break;

        default:
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Endpoint Not Found" }));
            break;
    }
}

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {string} endpoint
 */
async function handler(req, res, endpoint) {
    switch (req.method) {
        case "GET":
            await GET(req, res, endpoint);
            break;

        default:
            res.writeHead(405, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Method Not Allowed" }));
            break;
    }
}

module.exports = {
    handler,
};
