const fs = require("fs");
const { networkInterfaces } = require("os");
const { colors, logInfo, logDebug } = require("logger");

const { port } = require("../config/server.json");

const args = process.argv.slice(2);
const DEBUG = args.includes("--debug");
const DEV_MODE = args.includes("--dev");

const ADDR_PAD = 28;

function getLocalIp(name) {
    const nets = networkInterfaces();
    const info = name ? nets[name] : nets["Ethernet"] || nets["Wi-Fi"];
    if (!info) return "";
    const ipv4 = info.find((i) => i.family === "IPv4");
    const ip = ipv4.address;
    return `http://${ip}:${port}`;
}

async function printObject(obj) {
    await logInfo(colors.yellow("Object:"));
    const entries = Object.entries(obj);
    for (let [key, value] of entries) {
        if (key === "files") {
            if (value) value = value.map((file) => file.originalFilename);
            else continue;
        }
        value = JSON.stringify(value);
        if (value.length > 100) value = value.slice(0, 100) + "...";
        await logInfo(`${colors.blue("-".repeat(6))} ${colors.cyan(key)} : ${colors.magenta(value)}`);
    }
}

function createCookie(name, value, { path, domain, maxAge, expires, secure, samesite, httpOnly }) {
    let cookie = `${name}=${value}`;
    if (path) cookie += `;path=${path}`;
    if (domain) cookie += `;domain=${domain}`;
    if (maxAge) cookie += `;max-age=${maxAge}`;
    if (expires) cookie += `;expires=${expires.toUTCString()}`;
    if (secure) cookie += `;secure`;
    if (samesite) cookie += `;samesite=${samesite}`;
    if (httpOnly) cookie += `;HttpOnly`;
    return cookie;
}

async function exists(path) {
    return fs.promises
        .access(path, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}

async function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function padAddr(addr) {
    return addr.padEnd(ADDR_PAD);
}

module.exports = {
    DEBUG,
    DEV_MODE,
    getLocalIp,
    printObject,
    createCookie,
    exists,
    wait,
    padAddr,
};
