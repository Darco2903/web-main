import path from "path";
import { fileURLToPath } from "url";

const args = process.argv.slice(2);
export const IS_PROD = !args.includes("--dev");

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
/** The root folder of the project, containing server and client folders */
export const rootPath = path.resolve(__dirname, "../..");
