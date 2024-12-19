const fs = require("fs");
const http = require("http");
const https = require("https");
const { colors, logInfo, logDebug } = require("logger");

require("./prototypes");
const { DEBUG, DEV_MODE } = require("../utils");
const { handleRequest } = require("./requestHandler");

const { listen, port } = require("../../config/server.json");

const httpsOptions = {
    key: fs.readFileSync("./config/ssl/key.pem"),
    cert: fs.readFileSync("./config/ssl/cert.pem"),
    ca: fs.readFileSync("./config/ssl/ca.pem"),
};

// const server = http.createServer(handleRequest);
const server = https.createServer(httpsOptions, handleRequest);

async function start() {
    return new Promise((resolve) => {
        server.listen(port, async () => {
            await logInfo(`Server is listening ${colors.green(listen)}:${colors.yellow(port)}`);
            if (DEV_MODE) await logInfo(colors.red("----- DEV MODE -----"));
            await logDebug(colors.cyan("Debug mode enabled"));
            await logInfo(colors.green("Server started"));
            resolve();
        });
    });
}

function stop() {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = {
    server,
    start,
    stop,
};
