const { colors, logInfo, logDebug, setDevMode, setDebugMode } = require("logger");

const server = require("./core/server/index");
require("./core/socket/init");

const { db } = require("./database/index");
const { DEBUG, DEV_MODE } = require("./core/utils");

const proxy = require("./core/server/proxy");

const { listen, port, SERVER_PATH, WSAllowedOrigins, authServerOrigin, CLOUDFRONT_ID, authorizeNonCloudfront } = require("./config/server.json");

// (async () => {
//     await utils.printLog(colors.magenta("Starting server..."));
//     if (utils.DEV_MODE) await utils.printLog(colors.magenta.magenta("------- DEV MODE -------"));
//     await utils.printDebug("Debug mode enabled");
//     await utils.printLog(colors.gray("-".repeat(24)));

//     await utils.printDebug("Connecting to database...");
//     await db.connect().catch((err) => {
//         utils.printLog(colors.red("Error connecting to database =>"), colors.magenta(err.message));
//         process.exit(1);
//     });
//     await utils.printLog(colors.green("Database connected"));

//     await utils.printLog(
//         colors.cyan("Proxy Server"),
//         proxy.enabled ? colors.green("Enabled") : proxy.configOk ? colors.yellow("Disabled") : colors.red("Error")
//     );

//     server.listen(port, listen, async () => {
//         await utils.printLog(`Server is listening ${colors.green(listen)}:${colors.yellow(port)}`);
//     });
// })();

(async () => {
    setDebugMode(DEBUG);
    setDevMode(DEV_MODE);

    await logInfo(colors.magenta("Connecting to database..."));
    await db.connect().catch(async (err) => {
        await logInfo(colors.red("Error connecting to database =>"), colors.magenta(err.message));
        process.exit(1);
    });
    await logInfo(colors.green("Database connected"));

    await logInfo(
        colors.cyan("Proxy Server"),
        proxy.enabled ? colors.green("Enabled") : proxy.configOk ? colors.yellow("Disabled") : colors.red("Error")
    );

    await server.start();
})();
