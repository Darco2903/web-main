const { exists } = require("../../utils");

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @returns {Promise<void>}
 */
async function PUTRequestHandler(req, res) {
    // method not allowed
    res.writeHead(405, "Method Not Allowed");
    res.end();

    //////////////////////////

    // // const form = new formidable.IncomingForm();
    // // const [_, files] = await form.parse(req);
    // let [pathname, rawParams] = req.url.split("?");
    // pathname = SERVER_PATH + pathname;
    // // const params = new URLSearchParams(rawParams);
    // // const query = Object.fromEntries(params.entries());
    // // query.files = files.file;
    // // if (rawParams) await printObject(query);

    // if (!(await exists(pathname))) {
    //     res.writeHead(404, "Not Found");
    //     res.end();
    //     return;
    // }

    // const exec = require(pathname);
    // const response = await exec(req, res, query);
    // if (!res.closed) res.end(response);
}

module.exports = PUTRequestHandler;
