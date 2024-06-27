import { updateDLList } from "./handler.js";
import { upload } from "./requests.js";
import { parseSize } from "../../../../downloads/resources/js/utils.js";

const dlInputContainer = document.getElementById("dl-input-container");
/** @type {HTMLInputElement} */
const dlInput = document.getElementById("dl-input");

const dlInfoName = document.getElementById("dl-file-name");
const dlInfoSize = document.getElementById("dl-file-size");

const dlNameInput = document.getElementById("dl-name");
const dlLevelInput = document.getElementById("dl-level");

const dlUpload = document.getElementById("dl-upload");

const dlProgress = document.getElementById("dl-progress");
const dlProgressInfo = document.getElementById("dl-progress-info");

const searchInput = document.getElementById("search");
const refreshButton = document.getElementById("refresh");

const dlListContainer = document.getElementById("dl-list-container");
const dlList = document.getElementById("dl-list");
const dlListContent = document.getElementById("dl-list-content");

/** @type {Set<number>} */
const dragoverTimeouts = new Set();

dlInputContainer.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();

    dragoverTimeouts.forEach((t) => clearTimeout(t));
    dragoverTimeouts.clear();
    dlInputContainer.toggleAttribute("drag-over", true);
});

dlInputContainer.addEventListener("dragleave", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const t = setTimeout(() => {
        dragoverTimeouts.delete(t);
        dlInputContainer.toggleAttribute("drag-over", false);
    }, 50);
    dragoverTimeouts.add(t);
});

dlInputContainer.addEventListener("drop", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    dlInputContainer.toggleAttribute("drag-over", false);
    const file = event.dataTransfer.files[0];
    // console.log("file", file);
    if (!file) return;
    dlInput.files = event.dataTransfer.files;
    dlInput.dispatchEvent(new Event("change"));
});

dlInput.addEventListener("change", () => {
    const file = dlInput.files[0];
    if (!file) return;

    dlInfoName.innerText = file.name;
    dlInfoSize.innerText = parseSize(file.size);
    dlNameInput.value = file.name;
});

dlUpload.addEventListener("click", async () => {
    const file = dlInput.files[0];
    console.log("file", file);
    if (!file) return;

    dlProgress.max = file.size;
    const name = dlNameInput.value;
    const level = dlLevelInput.value;

    const dlId = await upload(file, name, level, (loaded, total, percent) => {
        dlProgress.value = loaded;
        dlProgressInfo.innerText = percent.toFixed(2);
    });

    console.log("dlId", dlId);

    await updateDLList();
});

refreshButton.addEventListener("click", updateDLList);

window.addEventListener("load", async () => {
    try {
        await updateDLList();
    } catch (error) {
        document.body.removeAttribute("hidden");
    }
});
