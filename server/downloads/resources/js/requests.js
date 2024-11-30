import { socket } from "../../../resources/js/socket.js";

const API_URL = "/api/v1";
const DOWNLOADS_URL = `${API_URL}/download`;

/**
 * @returns {Promise<{error?: string, result?: import("./types.js").DLFile[]}>}
 */
export async function getDownloads() {
    return socket.emitWithAck("downloads:getDownloads");
}

function createDLURL(id) {
    return `${window.location.origin}${DOWNLOADS_URL}/${id}`;
}

export function startDL(id, name) {
    const url = createDLURL(id);
    // console.log("startDL", url);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
}
