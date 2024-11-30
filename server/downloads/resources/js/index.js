import { socket } from "../../../resources/js/socket.js";
import { getDownloads, startDL } from "./requests.js";
import { parseSize } from "./utils.js";

const dlListContainer = document.querySelector("#dl-list-container");
const dlList = document.querySelector("#dl-list");
const fileClone = document.querySelector("#clones > .file");

const searchInput = document.getElementById("search");
const refreshButton = document.getElementById("refresh");

/**
 * Create a file div clone
 * @param {import("./types.js").DLFile} file
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
    const refresh = getDownloads();
    const anim = waitForAnim(refreshButton, { animName: "refresh-spin" });
    const [res] = await Promise.all([refresh, anim]);
    console.log("res", res);
    if (res.error) {
        console.error("error", res.error);
        alert("Error: " + res.error);
    } else {
        const files = res.result;
        dlList.innerHTML = "";
        const fileElems = files.map(createFileElem);
        dlList.append(...fileElems);
    }
    dlListContainer.toggleAttribute("loading", false);
}

refreshButton.addEventListener("click", updateDLList);

window.addEventListener("load", async () => {
    await updateDLList();
});
