import type { Plugin } from "vite";
import { AUTH_SERVER_ORIGIN, CDN_SERVER_ORIGIN, MANAGER_SERVER_ORIGIN, SERVER_ORIGIN } from "../config.js";

/** Read by client/src/modules/config.ts, keep both in sync */
const clientConfig = {
    serverOrigin: SERVER_ORIGIN,
    authServerOrigin: AUTH_SERVER_ORIGIN,
    cdnServerOrigin: CDN_SERVER_ORIGIN,
    managerServerOrigin: MANAGER_SERVER_ORIGIN,
};

// type="application/json" is data, never executed (no CSP nonce needed). Escaping "<" keeps a value from closing the tag.
const configTag = `<script id="app-config" type="application/json">${JSON.stringify(clientConfig).replace(/</g, "\\u003c")}</script>`;

/**
 * Puts the client config in index.html when it is served, so one client build works with any
 * environment and the config is there before the app starts, without an extra request
 */
export function injectClientConfig(html: string) {
    if (!html.includes("</head>")) {
        throw new Error("index.html has no </head> to put the client config before");
    }
    return html.replace("</head>", `    ${configTag}\n    </head>`);
}

/** Same injection for the Vite dev server, which serves index.html itself */
export function clientConfigPlugin(): Plugin {
    return {
        name: "client-config",
        transformIndexHtml: (html) => injectClientConfig(html),
    };
}
