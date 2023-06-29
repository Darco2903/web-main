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
    const res = await fetch("/downloads", {
        method: "POST",
    });
    if (res.ok) {
        return await res.json();
    }
}

window.addEventListener("load", async () => {
    const files = await getFiles();
    files.forEach((file) => {
        const fileDiv = createFileDiv();
        const a = fileDiv.querySelector("a");
        a.href = file.path;
        a.innerText = file.name;
        filesContent.appendChild(fileDiv);
    });
});
