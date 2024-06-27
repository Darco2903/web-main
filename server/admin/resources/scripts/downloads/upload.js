const fs = require("fs");
const path = require("path");

const { db } = require("../../../../../database/index");
const utils = require("../../../../../utils");

const { PATH } = require("../../../../../config/download.json");

function sendError(res, code, message) {
    res.statusCode = code;
    res.end(message);
}

function generateRandomString(length) {
    let str = "";
    do {
        str += Math.random().toString(36).substring(2);
    } while (str.length < length);
    return str.substring(0, length);
}

async function generateId() {
    let id;
    do {
        id = generateRandomString(16);
    } while (await db.findOne("downloads", { where: { id } }));
    return id;
}

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {object} query
 * @param {import("formidable").Files[]} query.files
 * @param {string} query.filename
 * @param {number} query.level
 */
async function upload(req, res, { files, filename, level }) {
    const file = files[0];
    // console.log("File", file);

    if (!file) {
        console.log("No file");
        sendError(res, 400, "NO_FILE");
        return;
    }

    if (isNaN(level)) {
        console.log("No level");
        sendError(res, 400, "NO_LEVEL");
        return;
    }

    const from = file.filepath;
    if (!(await utils.exists(from))) {
        console.log("File not found");
        sendError(res, 404, "FILE_NOT_FOUND");
        return;
    }

    const id = await generateId();
    const to = path.join(PATH, id);

    try {
        await fs.promises.rename(from, to).catch(async (error) => {
            await utils.printLog("Could not rename file", error);
            await utils.printLog("Trying to copy the file");
            // try to copy the file
            await fs.promises.copyFile(from, to);
            // delete the original file
            await fs.promises.unlink(from);
        });

        console.log("inserting", {
            id,
            name: filename,
            level,
            path: to,
            size: file.size,
        });

        await db.insert("downloads", {
            id,
            name: filename,
            level,
            path: to,
            size: file.size,
        });
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(id);
    } catch (error) {
        console.error("Error", error);
        sendError(res, 500, "INTERNAL_ERROR");

        // cleanup
        if (await utils.exists(from)) await fs.promises.unlink(from);
        if (await utils.exists(to)) await fs.promises.unlink(to);
    }
}

module.exports = upload;
