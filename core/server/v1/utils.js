import { logError } from "logger";

export function sendAPI(res, result = false, data = {}) {
    res.status(200).send(Object.assign({ result }, data));
}

export function errorAPI(res, status, error = "", data = {}) {
    res.status(status).send(Object.assign({ result: false, error }, data));
}
