const { Table } = require("darco2903-db");

module.exports = [
    new Table({
        name: "downloads",
        columns: {
            id: {
                type: "varchar",
                primary: true,
                length: 255,
            },
            name: {
                type: "varchar",
                length: 255,
            },
            level: {
                type: "smallint",
            },
            path: {
                type: "varchar",
                length: 255,
            },
            size: {
                type: "int",
            },
            created_at: {
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
            },
            updated_at: {
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
                onUpdate: "CURRENT_TIMESTAMP",
            },
        },
        uniques: [
            {
                name: "dowloads_name_unique",
                columns: ["name"],
            },
        ],
    }),
];
