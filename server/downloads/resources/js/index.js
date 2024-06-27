import { startDL, parseSize } from "./utils.js";

const dlListContainer = document.querySelector("#dl-list-container");
const dlList = document.querySelector("#dl-list");
const fileClone = document.querySelector("#clones > .file");

const searchInput = document.getElementById("search");
const refreshButton = document.getElementById("refresh");

/**
 * @typedef {Object} DLFile
 * @property {string} id
 * @property {string} name
 * @property {number} size
 */

/**
 * Create a file div clone
 * @param {DLFile} file
 * @returns {HTMLElement}
 */
function createFileElem({ id, name, size }) {
    /** @type {HTMLDivElement} */
    const elem = fileClone.cloneNode(true);
    const iconElem = elem.querySelector(".download-icon");
    const nameElem = elem.querySelector(".download-name");
    elem.dataset.id = id;
    elem.dataset.name = name.toLowerCase();
    nameElem.innerText = name;

    elem.addEventListener("click", () => {
        // console.log("download", id);
        startDL(id, name);
    });
    return elem;
}

/**
 * @returns {Promise<DLFile[]>}
 */
async function getFiles() {
    const res = await fetch(`${window.location.pathname}resources/scripts/getDownloads.js`, {
        method: "POST",
    });
    if (!res.ok) return [];
    return await res.json();
}

searchInput.addEventListener("input", () => {
    const search = searchInput.value.toLowerCase();
    const files = dlList.querySelectorAll(".file");
    files.forEach((file) => {
        const inSearch = file.dataset.name.includes(search);
        file.toggleAttribute("filtered", !inSearch);
    });
});

async function updateDLList() {
    dlListContainer.toggleAttribute("loading", true);
    // refreshButton.disabled = true;
    const refresh = getFiles();
    const anim = waitForAnim(refreshButton, { animName: "refresh-spin" });
    const [files] = await Promise.all([refresh, anim]);
    console.log("files", files);
    dlList.innerHTML = "";
    const fileElems = files.map(createFileElem);
    dlList.append(...fileElems);
    dlListContainer.toggleAttribute("loading", false);
}

refreshButton.addEventListener("click", updateDLList);

window.addEventListener("load", async () => {
    await updateDLList();
});
