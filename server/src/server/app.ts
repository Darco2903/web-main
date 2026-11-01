import fs from "fs";
import https from "https";
import express from "express";
import { SSL } from "../config.js";
import type { ViteDevServer } from "vite";
import { clientConfigPlugin } from "./clientConfig.js";

const httpsOptions = {
    key: fs.readFileSync(SSL.keyPath, "utf8"),
    cert: fs.readFileSync(SSL.certPath, "utf8"),
    ca: fs.readFileSync(SSL.caPath, "utf8"),
};

export async function createViteServer(clientPath: string) {
    const { createServer } = await import("vite");
    vite = await createServer({
        root: clientPath,
        server: { hmr: { server } },
        // Merged with the plugins of client/vite.config.ts
        plugins: [clientConfigPlugin()],
    });
    return vite;
}

export const app = express();
export const server = https.createServer(httpsOptions, app);
export let vite: ViteDevServer | null = null;
