const request = require("request");

const { printLog, printDebug } = require("../utils");

let config;
let configOk = false;

try {
    config = require("../config/proxy.json");
    configOk = config && config.path && config.allowed;
} catch (e) {}

const pathLength = config?.path?.length + 1;

/**
 * Check if the url is allowed
 * @param {string} url
 * @returns {boolean}
 */
function isAllowed(url) {
    return config.allowed.some((u) => url.startsWith(u));
}

/**
 * Check if the request is a proxy request
 * @param {import("http").IncomingMessage} req
 * @returns {boolean}
 */
function isRequest(req) {
    return req.url.startsWith(config.path);
}

/**
 * Check if the request is a proxy request
 * @param {import("http").IncomingMessage} req
 * @returns {string}
 */
function parseUrl(req) {
    return req.url.substring(pathLength);
}

/**
 * Proxy the request to the specified url
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {string} url
 * @returns {Promise<void>}
 */
async function proxy(req, res, url) {
    return new Promise((resolve, reject) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        req.pipe(request(url)).on("error", reject).pipe(res).on("finish", resolve);
    });
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @returns {Promise<void>}
 */
async function proxyRequest(req, res) {
    const url = parseUrl(req);
    if (!enabled) {
        printLog(colors.red("Proxy disabled"), colors.cyan(url));
        res.writeHead(503, "Service Unavailable");
    } else if (isAllowed(url)) {
        printLog(colors.green("Proxy to"), colors.cyan(url));
        await proxy(req, res, url).catch((error) => {
            printLog(colors.red("Error proxying to"), colors.cyan(url));
            printDebug(error);
            res.writeHead(502, "Bad Gateway");
        });
    } else {
        printLog(colors.red("Unauthorized access to"), colors.cyan(url));
        res.writeHead(403, "Forbidden");
    }
    res.end();
}

module.exports = {
    isAllowed,
    configOk,
    enabled: config?.enabled ?? false,
    isRequest,
    parseUrl,
    proxy,
    proxyRequest,
};
