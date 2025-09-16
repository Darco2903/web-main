import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const args = process.argv.slice(2);
export const IS_PROD = !args.includes("--dev");

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const rootPath = path.resolve(__dirname, "..");

export async function exists(filePath: string) {
    return fs.promises
        .access(filePath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}
