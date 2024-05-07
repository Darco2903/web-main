const http = require("http");
const WebSocketServer = require("websocket").server;
const { color } = require("console-log-colors");

const utils = require("./utils.js");
const proxy = require("./utils/proxy.js");

const { listen, port, SERVER_PATH, WSAllowedOrigins } = require("./config/server.json");

async function handleRequest(req, res) {
    try {
        const remote = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
        utils.printLog(color.green(remote), color.yellow(req.method), color.cyan(req.url));

        switch (req.method) {
            case "GET":
                await utils.GETRequestHandler(req, res);
                break;

            case "POST":
                await utils.POSTRequestHandler(req, res);
                break;

            case "HEAD":
                await utils.HEADRequestHandler(req, res);
                break;

            default:
                res.writeHead(405, "Method Not Allowed");
                res.end("Method Not Allowed");
                break;
        }
        utils.printLog(color.green(remote), color.yellow(res.statusCode));
    } catch (error) {
        utils.printLog(color.red(error.message));
        utils.printDebug(error.stack, error.code);

        switch (error.code) {
            case "AUTH_SERVER_ERROR":
                res.writeHead(503, "Service Unavailable");
                res.end(error.message);
                break;

            case "UNKNOWN_CATEGORY":
                res.writeHead(404, "Not Found");
                res.end(error.message);
                break;

            default:
                res.writeHead(500, "Internal Server Error");
                res.end("Internal Server Error");
                break;
        }
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
        utils.printLog(
            color.green(req.remoteAddress),
            color.yellow("WebSocket"),
            color.cyan(req.resourceURL.pathname),
            color.red("Rejected: Origin not allowed")
        );
        return;
    }

    // if not echo-protocol
    if (req.requestedProtocols[0] !== "echo-protocol") {
        req.reject();
        utils.printLog(
            color.green(req.remoteAddress),
            color.yellow("WebSocket"),
            color.cyan(req.resourceURL.pathname),
            color.red("Rejected: Protocol not allowed")
        );
        return;
    }

    const path = SERVER_PATH + req.resource;
    if (!(await utils.exists(path))) {
        req.reject();
        utils.printLog(
            color.green(req.remoteAddress),
            color.yellow("WebSocket"),
            color.cyan(req.resourceURL.pathname),
            color.red("Rejected: Path not found")
        );
        return;
    }

    const connection = req.accept("echo-protocol", req.origin);
    utils.printLog(color.green(req.remoteAddress), color.yellow("WebSocket"), color.cyan(req.resourceURL.pathname), color.green("Accepted"));

    const handleConnection = require(path);
    handleConnection(req, connection);
    connection.addListener("message", (message) => {
        utils.printLog(
            color.green(req.remoteAddress),
            color.yellow("WebSocket"),
            color.cyan(req.resourceURL.pathname),
            color.green("Received Message"),
            message.utf8Data.length > 100 ? message.utf8Data.substring(0, 100) + "..." : message.utf8Data
        );
    });
});

(async () => {
    utils.printLog(color.magenta("Starting server..."));
    if (utils.DEV_MODE) utils.printLog(color.magenta.magenta("----- DEV MODE -----"));
    utils.printDebug(color.magenta("Debug mode enabled"));

    utils.printLog(
        color.cyan("Proxy Server"),
        proxy.enabled ? color.green("enabled") : proxy.configOk ? color.yellow("Disabled") : color.red("Error")
    );

    server.listen(port, listen, () => {
        utils.printLog(`Server is listening ${color.green(listen)}:${color.yellow(port)}`);
    });
})();
