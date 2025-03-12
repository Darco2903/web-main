import fs from "fs";

export const ADDR_PAD = 39;

const args = process.argv.slice(2);
export const IS_PROD = !args.includes("--dev");

export async function exists(filePath) {
    return fs.promises
        .access(filePath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}
