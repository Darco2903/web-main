const BASE_PATH = "/admin/resources/scripts/downloads/";

/**
 * @returns {Promise<import("../../../../downloads/resources/js/utils").DL[]>}
 */
export async function getDownloads() {
    const res = await fetch(BASE_PATH + "getAll.js", {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to fetch downloads");
    return res.json();
}

/**
 * @param {File} file
 * @param {(loaded: number, total: number, percent: number) => void} progressCb
 * @returns {Promise<string>}
 */
export async function upload(file, name, level, progressCb) {
    if (!file) throw new Error("No file provided");
    if (!name) throw new Error("No name provided");
    if (isNaN(level)) throw new Error("Level must be a number");

    let loaded = 0;
    const total = file.size;
    const url = new URL(BASE_PATH + "upload.js", window.location.origin);
    url.searchParams.append("filename", name);
    url.searchParams.append("level", level);

    const streamLogger = new TransformStream({
        transform(chunk, controller) {
            loaded += chunk.length;
            const percent = (loaded / total) * 100;
            // console.log("Progress", percent.toFixed(2) + "%");
            progressCb(loaded, total, percent);
            controller.enqueue(chunk);
        },
    });

    const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: file.stream().pipeThrough(streamLogger),
        duplex: "half",
    });

    const message = await res.text();
    if (!res.ok) throw new Error(message);
    return message;
}

export async function deleteDownload(id) {
    const res = await fetch(BASE_PATH + "delete.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("Failed to delete download");
    return res.text();
}

export async function updateDownload(id, name, level) {
    const res = await fetch(BASE_PATH + "update.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, level }),
    });
    if (!res.ok) throw new Error("Failed to update download");
    return res.text();
}
