import { DataBase } from "darco2903-db";

import _ from "./tables/_.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dbConfig = require("../config/database.json");

export const db = new DataBase({
    ...dbConfig,
    tables: [
        //
        _,
    ],
});
