const http = require("http");
const { color } = require("console-log-colors");

const utils = require("./utils");
const downloads = require("./downloads");

const { listen, port } = require("./config.json");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function POSTRequest(req, res) {
    let data;
    if (req.headers["content-type"] === "application/json") {
        const body = await req.getBody();
        data = JSON.parse(body);
    }

    switch (req.url) {
        default:
            res.writeHead(404, "Not Found");
            res.end();
            break;
    }
    return Promise.resolve();
}

const s = http.createServer(async (req, res) => {
    try {
        const remote = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
        utils.printLog(color.green(remote), color.yellow(req.method), color.cyan(req.url));

        switch (req.method) {
            case "GET":
                utils.GETRequestHandler(req, res);
                break;

            case "POST":
                await POSTRequest(req, res);
                break;
        }
        utils.printLog(color.green(remote), color.yellow(res.statusCode));
    } catch (error) {
        console.error(error);
        res.writeHead(500, "Internal Server Error");
        res.end("Internal Server Error");
    }
});

s.listen(port, listen, async () => {
    utils.printLog(`Server is listening ${color.green(listen)}:${color.yellow(port)}`);
});
