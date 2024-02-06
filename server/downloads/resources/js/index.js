const filesContent = document.querySelector("#files-content");
const fileClone = document.querySelector("#clones > .file");

/**
 * @returns {HTMLElement}
 */
function createFileDiv() {
    return fileClone.cloneNode(true);
}

/**
 *
 * @returns {Promise<{name: string, path: string}[]>}
 */
async function getFiles() {
    const res = await fetch(`${window.location.pathname}resources/scripts/getFiles.js`, {
        method: "POST",
    });
    if (res.ok) {
        return await res.json();
    }
}

/**
 * Parse size to human readable format in octets
 *
 * @param {number} size
 * @returns {string}
 */
function parseSize(size) {
    const units = ["o", "Ko", "Mo", "Go", "To"];
    let i = 0;
    while (size > 1024) {
        size /= 1024;
        i++;
    }
    return size.toFixed(2) + " " + units[i];
}

window.addEventListener("load", async () => {
    const files = await getFiles();
    console.log(files);
    files.forEach((file) => {
        const fileDiv = createFileDiv();
        const a = fileDiv.querySelector("a");
        a.href = file.path;
        a.innerText = `${file.name} (${parseSize(file.size)})`;
        filesContent.appendChild(fileDiv);
    });
});
