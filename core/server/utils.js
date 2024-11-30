const fs = require("fs");
const path = require("path");
const AuthAPI = require("auth-api");

const restrictedPath = require("../../config/restrictedPath.json");
const { API_PATH } = require("../../config/api.json");
const { logError } = require("logger");

const AUTH_CACHE_TIMEOUT = 1000;
const authCache = new Map();

const PERMISSION_CACHE_TIMEOUT = 1000;
const permissionCache = new Map();

/**
 * @param {import("http").IncomingMessage} req
 * @returns {string}
 */
function getHost(req) {
    return req.headers.host;
}

/**
 * @param {string} host
 * @returns {string}
 */
function getDomain(host) {
    const removePort = host.split(":")[0];
    const domain = removePort.split(".").slice(-2).join(".");
    return domain;
}

/**
 * @param {string} host
 * @returns {boolean}
 */
function isIp(host) {
    const removePort = host.split(":")[0];
    const split = removePort.split(".");
    return (
        split.length === 4 &&
        split.every((part) => {
            if (isNaN(part)) return false;
            const num = parseInt(part);
            return num >= 0 && num <= 255;
        })
    );
}

/**
 * @param {import("http").IncomingMessage} req
 * @returns {boolean}
 */
function isAPIRequest(req) {
    return req.url.startsWith(API_PATH);
}

function getPathPermission(reqPath) {
    return Object.keys(restrictedPath)
        .filter((path) => reqPath.startsWith(path))
        .map((path) => restrictedPath[path])
        .reduce((highest, current) => (current > highest ? current : highest), 0);
}

function cacheAuth(sessionId, isAuth) {
    // console.log("Caching auth", sessionId, isAuth);
    authCache.set(sessionId, isAuth);
    setTimeout(() => authCache.delete(sessionId), AUTH_CACHE_TIMEOUT);
}

/**
 * @param {http.IncomingMessage} req
 */
async function isAuthenticated(req) {
    const { session_id } = req.getCookies();
    // console.log("Session ID", session_id);
    if (!session_id) return false;
    if (authCache.has(session_id)) {
        // console.log("Using cached auth", session_id);
        return authCache.get(session_id);
    }
    const { result, error } = await AuthAPI.auth(session_id);
    cacheAuth(session_id, result);
    return result;
}

function cachePermissionKey(sessionId, level) {
    return `${sessionId}-${level}`;
}

function cachePermission(sessionId, level, hasPerm) {
    // console.log("Caching permission", sessionId, level, hasPerm);
    permissionCache.set(`${sessionId}-${level}`, hasPerm);
    setTimeout(() => permissionCache.delete(`${sessionId}-${level}`), PERMISSION_CACHE_TIMEOUT);
}

/**
 * @param {http.IncomingMessage} req
 * @param {number} level
 */
async function hasPermission(req, level) {
    if (level === 0) return true;
    const { session_id } = req.getCookies();
    if (!session_id) return false;
    const permKey = cachePermissionKey(session_id, level);
    if (permissionCache.has(permKey)) {
        // console.log("Using cached permission", session_id, level);
        return permissionCache.get(permKey);
    }

    // console.log(session_id, level);
    const { result, error } = await AuthAPI.hasPermission(session_id, level);

    if (error) {
        result = false;
        logError("Auth:", error);
    }

    // console.log(result);
    cachePermission(session_id, level, result);
    return result;
}

module.exports = {
    getHost,
    getDomain,
    isIp,
    isAPIRequest,
    getPathPermission,
    hasPermission,
    isAuthenticated,
};
