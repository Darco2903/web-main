const { orm } = require("darco2903-db");

const AuthAPI = require("auth-api");
const { db } = require("../../../../database/index");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {object} query
 */
async function exec(req, res, query) {
    let dl = [];
    const { session_id } = req.getCookies();
    let { result, level } = await AuthAPI.permission(session_id);
    // console.log("result", result, "level", level);
    if (!result) level = 0;

    dl = await db.find("downloads", {
        where: { level: orm.LessThanOrEqual(level) },
    });

    // console.log("dl", dl);

    res.writeHead(200, { "Content-Type": "application/json" });
    const data = dl.map(({ id, name, size }) => ({ id, name, size }));
    res.end(JSON.stringify(data));
}

module.exports = exec;
