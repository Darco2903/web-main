const { DataBase } = require("darco2903-db");

const downloadsTable = require("./tables/downloads");

const { database, host, password, port, type, user } = require("../config/database.json");

const db = new DataBase({
    database,
    host,
    password,
    port,
    type,
    user,
    tables: [...downloadsTable],
});

module.exports = {
    db,
};
