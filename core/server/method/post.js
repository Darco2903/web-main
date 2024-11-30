const path = require("path");
// const formidable = require("formidable");
const { printObject } = require("../../utils");

const { SERVER_PATH } = require("../../../config/server.json");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @returns {Promise<void>}
 */
async function POSTRequestHandler(req, res) {
    // method not allowed
    res.writeHead(405, "Method Not Allowed");
    res.end();

    //////////////////////////

    // const handlerPath = path.join(process.cwd(), SERVER_PATH + req.url);
    // const form = new formidable.IncomingForm({
    //     // maxFiles: 0,
    //     uploadDir: UPLOAD_PATH,
    //     keepExtensions: true,
    //     maxFileSize: 200 * 1024 * 1024,
    //     maxTotalFileSize: 200 * 1024 * 1024,
    // });
    // const [fields, { file }] = await form.parse(req);
    // // const [fields] = await form.parse(req);
    // const entries = Object.entries(fields)
    //     .filter(([, value]) => value !== "")
    //     .map(([key, value]) => (value.length === 1 ? [key, value[0]] : [key, value]));
    // const query = Object.fromEntries(entries);
    // const keys = Object.keys(fields);
    // query.files = file;
    // if (keys.length !== 0) printObject(query);
    // /** @type {function(http.IncomingMessage, http.ServerResponse, any): Promise<any>} */
    // const exec = require(handlerPath);
    // const response = await exec(req, res, query);
    // if (!res.closed) res.end(response);
}

module.exports = POSTRequestHandler;
