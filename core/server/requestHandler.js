const { colors, logInfo, logDebug } = require("logger");

const { padAddr, padMethod } = require("../utils");
const utils = require("./utils");

const { handleAPIRequest } = require("./api/handler");
const proxy = require("./proxy");

const GET = require("./method/get");
const POST = require("./method/post");
const PUT = require("./method/put");
const HEAD = require("./method/head");

const {
    listen,
    port,
    SERVER_PATH,
    WSAllowedOrigins,
    authServerOrigin,
    CLOUDFRONT_ID,
    authorizeNonCloudfront,
    CONTENT_SERVER_PATH,
} = require("../../config/server.json");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 */
async function handleRequest(req, res) {
    try {
        const forwardedFor = req.headers["x-forwarded-for"];
        const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : req.socket.remoteAddress;
        const remote = `${clientIp}:${req.socket.remotePort}`;
        const padRemote = padAddr(remote);
        const method = padMethod(req.method);


        if (utils.isAPIRequest(req)) {
            await logInfo(colors.green(padRemote), colors.yellow(method), colors.cyan(req.url), colors.magenta("API request"));
            await handleAPIRequest(req, res);
            return;
        }

        const permRequired = utils.getPathPermission(req.url);
        if (!utils.DEV_MODE && permRequired > 0) {
            const authenticated = await utils.isAuthenticated(req).catch((err) => err);

            if (authenticated?.code === "AUTH_API_ERROR") {
                await logInfo(
                    colors.green(padRemote),
                    colors.yellow(res.statusCode),
                    colors.magenta("Unauthorized: auth server error"),
                    colors.red(authenticated.message)
                );
                res.writeHead(503, "Service Unavailable");
                res.end("Service Unavailable");
                return;
            } else if (authenticated === false) {
                const authUrl = new URL("login", authServerOrigin);
                const redirectUrl = new URL(req.url, `http://${req.headers.host}`);
                authUrl.searchParams.set("redirect", redirectUrl.href);
                res.writeHead(302, {
                    Location: authUrl.href,
                });
                res.end();
                await logInfo(colors.green(padRemote), colors.yellow(res.statusCode), colors.magenta("Unauthorized: not authenticated"));
                return;
            } else if (!(await utils.hasPermission(req, permRequired))) {
                res.statusCode = 403;
                res.end("Forbidden");
                await logInfo(colors.green(padRemote), colors.yellow(res.statusCode), colors.magenta("Unauthorized: not enough permissions"));
                return;
            } else {
                await logInfo(colors.green(padRemote), colors.yellow(method), colors.cyan(req.url), colors.magenta("Authorized"));
            }
        } else {
            await logInfo(colors.green(padRemote), colors.yellow(method), colors.cyan(req.url));
        }

        if (proxy.configOk && proxy.isRequest(req)) {
            await proxy.proxyRequest(req, res);
            return;
        }

        switch (req.method) {
            case "GET":
                await GET(req, res);
                break;

            case "POST":
                await POST(req, res);
                break;

            case "PUT":
                await PUT(req, res);
                break;

            case "HEAD":
                await HEAD(req, res);
                break;

            default:
                res.writeHead(405, "Method Not Allowed");
                res.end("Method Not Allowed");
                break;
        }
        await logInfo(colors.green(padRemote), colors.yellow(res.statusCode));
    } catch (error) {
        await logInfo(colors.red(error.message));
        await logDebug(error.stack, error.code);

        res.writeHead(500, "Internal Server Error");
        res.end("Internal Server Error");
    }
}

module.exports = {
    handleRequest,
};
