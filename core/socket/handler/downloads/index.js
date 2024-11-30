const AuthAPI = require("auth-api");
const { orm } = require("darco2903-db");
const { logError, logDebug } = require("logger");

const { db } = require("../../../../database/index");
const { getCallback, socketHandler } = require("../../utils");

async function findDL(level) {
    return db.find("downloads", {
        where: { level: orm.LessThanOrEqual(level) },
        select: ["id", "name", "size"],
    });
}

module.exports = socketHandler((socket) => {
    const session_id = socket.user.session_id;

    socket.on("downloads:getDownloads", async (...args) => {
        const callback = getCallback(args);

        let { result, level } = await AuthAPI.permission(session_id);
        if (!result) level = 0;

        logDebug("downloads:getDownloads level", level);

        findDL(level)
            .then((dl) => {
                callback({ result: dl });
            })
            .catch((err) => {
                logError("downloads:getDownloads", err);
                callback({ error: "Internal error" });
            });
    });
});
