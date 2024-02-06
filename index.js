const http = require("http");
const WebSocketServer = require("websocket").server;
const { color } = require("console-log-colors");

const utils = require("./utils.js");

const { listen, port, SERVER_PATH } = require("./config.json");

async function handleRequest(req, res) {
    try {
        const remote = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
        utils.printLog(color.green(remote), color.yellow(req.method), color.cyan(req.url));

        switch (req.method) {
            case "GET":
                utils.GETRequestHandler(req, res);
                break;

            case "POST":
                await utils.POSTRequestHandler(req, res);
                break;

            case "HEAD":
                utils.HEADRequestHandler(req, res);
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

function originIsAllowed(origin) {
    switch (origin) {
        case "http://localhost:8080":
        case "https://localhost:8080":
        case "http://127.0.0.1:8080":
        case "https://127.0.0.1:8080":
        case "https://darco2903.fr":
        case "http://dev.local.darco2903.fr:8080":
            return true;
    }
    return false;
}

wsServer.on("request", (req) => {
    if (!originIsAllowed(req.origin)) {
        req.reject();
        utils.printLog(color.green(req.remoteAddress), color.yellow("WebSocket"), color.cyan(req.resourceURL.pathname), color.red("Rejected"));
        return;
    }
    utils.printLog(color.green(req.remoteAddress), color.yellow("WebSocket"), color.cyan(req.resourceURL.pathname), color.green("Accepted"));

    const connection = req.accept("echo-protocol", req.origin);
    const path = SERVER_PATH + req.resource;

    const handleConnection = require(path);
    handleConnection(req, connection);
    connection.addListener("message", (message) => {
        utils.printLog(
            color.green(req.remoteAddress),
            color.yellow("WebSocket"),
            color.cyan(req.resourceURL.pathname),
            color.green("Received Message"),
            message.utf8Data
        );
    });
});

(async () => {
    utils.printLog(color.magenta("Starting server..."));
    if (utils.DEV_MODE) utils.printLog(color.magenta.magenta("----- DEV MODE -----"));
    utils.printDebug(color.magenta("Debug mode enabled"));

    server.listen(port, listen, () => {
        utils.printLog(`Server is listening ${color.green(listen)}:${color.yellow(port)}`);
    });
})();
