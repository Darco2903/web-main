const http = require("http");
const { colors } = require("logger");
const { server: WebSocketServer } = require("websocket");

const { db } = require("./database/index");

const utils = require("./utils");
const proxy = require("./utils/proxy");
const downloadHandler = require("./utils/downloadHandler");

const { listen, port, SERVER_PATH, WSAllowedOrigins, authServerOrigin, CLOUDFRONT_ID, authorizeNonCloudfront } = require("./config/server.json");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function handleRequest(req, res) {
    try {
        const remote = `${req.socket.remoteAddress}:${req.socket.remotePort}`;

        const cloudfrontID = req.headers["cloudfront-id"];
        if (!authorizeNonCloudfront && cloudfrontID !== CLOUDFRONT_ID) {
            await utils.printLog(
                colors.green(remote),
                colors.yellow(res.statusCode),
                colors.cyan(req.url),
                colors.magenta("Refused: non-CloudFront request")
            );
            res.writeHead(403, "Forbidden");
            res.end("Forbidden");
            return;
        }

        const permRequired = utils.getPathPermission(req.url);
        if (!utils.DEV_MODE && permRequired > 0) {
            const authenticated = await utils.isAuthenticated(req).catch((err) => err);

            if (authenticated?.code === "AUTH_API_ERROR") {
                await utils.printLog(
                    colors.green(remote),
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
                await utils.printLog(colors.green(remote), colors.yellow(res.statusCode), colors.magenta("Unauthorized: not authenticated"));
                return;
            } else if (!(await utils.hasPermission(req, permRequired))) {
                res.statusCode = 403;
                res.end("Forbidden");
                await utils.printLog(colors.green(remote), colors.yellow(res.statusCode), colors.magenta("Unauthorized: not enough permissions"));
                return;
            } else {
                await utils.printLog(colors.green(remote), colors.yellow(req.method), colors.cyan(req.url), colors.magenta("Authorized"));
            }
        } else {
            await utils.printLog(colors.green(remote), colors.yellow(req.method), colors.cyan(req.url));
        }

        switch (req.method) {
            case "GET":
                if (proxy.configOk && proxy.isRequest(req)) await proxy.proxyRequest(req, res);
                else if (req.url.startsWith("/download/")) await downloadHandler(req, res);
                else await utils.GETRequestHandler(req, res);
                break;

            case "POST":
                await utils.POSTRequestHandler(req, res);
                break;

            case "PUT":
                await utils.PUTRequestHandler(req, res);
                break;

            case "HEAD":
                await utils.HEADRequestHandler(req, res);
                break;

            default:
                res.writeHead(405, "Method Not Allowed");
                res.end("Method Not Allowed");
                break;
        }
        await utils.printLog(colors.green(remote), colors.yellow(res.statusCode));
    } catch (error) {
        await utils.printLog(colors.red(error.message));
        await utils.printDebug(error.stack, error.code);

        res.writeHead(500, "Internal Server Error");
        res.end("Internal Server Error");
    }
}

const server = http.createServer(handleRequest);
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
});

wsServer.on("request", async (req) => {
    if (!WSAllowedOrigins.includes(req.origin)) {
        req.reject();
        await utils.printLog(
            colors.green(req.remoteAddress),
            colors.yellow("WebSocket"),
            colors.cyan(req.resourceURL.pathname),
            colors.red("Rejected: Origin not allowed")
        );
        return;
    }

    // if not echo-protocol
    if (req.requestedProtocols[0] !== "echo-protocol") {
        req.reject();
        await utils.printLog(
            colors.green(req.remoteAddress),
            colors.yellow("WebSocket"),
            colors.cyan(req.resourceURL.pathname),
            colors.red("Rejected: Protocol not allowed")
        );
        return;
    }

    const path = SERVER_PATH + req.resource;
    if (!(await utils.exists(path))) {
        req.reject();
        await utils.printLog(
            colors.green(req.remoteAddress),
            colors.yellow("WebSocket"),
            colors.cyan(req.resourceURL.pathname),
            colors.red("Rejected: Path not found")
        );
        return;
    }

    const connection = req.accept("echo-protocol", req.origin);
    await utils.printLog(
        colors.green(req.remoteAddress),
        colors.yellow("WebSocket"),
        colors.cyan(req.resourceURL.pathname),
        colors.green("Accepted")
    );

    const handleConnection = require(path);
    handleConnection(req, connection);
    connection.addListener("message", async (message) => {
        await utils.printLog(
            colors.green(req.remoteAddress),
            colors.yellow("WebSocket"),
            colors.cyan(req.resourceURL.pathname),
            colors.green("Received Message"),
            message.utf8Data.length > 100 ? message.utf8Data.substring(0, 100) + "..." : message.utf8Data
        );
    });
});

(async () => {
    await utils.printLog(colors.magenta("Starting server..."));
    if (utils.DEV_MODE) await utils.printLog(colors.magenta.magenta("------- DEV MODE -------"));
    await utils.printDebug("Debug mode enabled");
    await utils.printLog(colors.gray("-".repeat(24)));
    await utils.printDebug("Connecting to database...");
    await db.connect();
    await utils.printLog(colors.green("Connected to database"));

    await utils.printLog(
        colors.cyan("Proxy Server"),
        proxy.enabled ? colors.green("Enabled") : proxy.configOk ? colors.yellow("Disabled") : colors.red("Error")
    );

    server.listen(port, listen, async () => {
        await utils.printLog(`Server is listening ${colors.green(listen)}:${colors.yellow(port)}`);
    });
})();
