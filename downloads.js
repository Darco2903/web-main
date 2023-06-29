const fs = require("fs");
const path = require("path");

const SERVER_PATH = "server";
const STORAGE_PATH = "/downloads/storage";

const FULL_STORAGE_PATH = path.join(SERVER_PATH, STORAGE_PATH);

if (!fs.existsSync(FULL_STORAGE_PATH)) {
    fs.mkdirSync(FULL_STORAGE_PATH);
}

function getDownloadableFiles() {
    return fs.readdirSync(FULL_STORAGE_PATH).map((file) => {
        return {
            name: file,
            path: path.join(STORAGE_PATH, file),
        };
    });
}

module.exports = {
    getDownloadableFiles,
};
