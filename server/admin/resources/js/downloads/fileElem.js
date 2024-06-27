import { updateDLList } from "./handler.js";
import { deleteDownload, updateDownload } from "./requests.js";
import { createDLURL, parseDate, parseSize, startDL } from "../../../../downloads/resources/js/utils.js";

function createTD(className, text = "") {
    const td = document.createElement("td");
    const div = document.createElement("div");
    td.classList.add("dl-cell", className);
    div.classList.add("dl-cell-content");
    div.innerText = text;
    td.append(div);
    return td;
}

function createButton(className, text, click) {
    const button = document.createElement("button");
    button.classList.add("user-but", "txt", className);
    button.innerText = text;
    button.addEventListener("click", click);
    return button;
}

/**
 * Create a download element
 * @param {import("../../../../downloads/resources/js/utils.js").DL} dl
 * @returns {HTMLElement}
 */
export function createDLElem(dl) {
    const elem = document.createElement("tr");
    elem.dataset.id = dl.id;

    const nameElem = createTD("dl-name", dl.name);
    const pathElem = createTD("dl-path", dl.path);
    const levelElem = createTD("dl-level", dl.level);
    const sizeElem = createTD("dl-size", parseSize(dl.size));
    const creationElem = createTD("dl-creation", parseDate(dl.updated_at));
    const updateElem = createTD("dl-update", parseDate(dl.updated_at));

    const nameEditInput = document.createElement("input");
    nameEditInput.type = "text";
    nameEditInput.value = dl.name;
    nameEditInput.classList.add("dl-name-input");
    nameEditInput.classList.add("dl-edit-input");
    nameElem.append(nameEditInput);

    const levelEditInput = document.createElement("input");
    levelEditInput.type = "number";
    levelEditInput.value = dl.level;
    levelEditInput.classList.add("dl-level-input");
    levelEditInput.classList.add("dl-edit-input");
    levelEditInput.min = 0;
    levelEditInput.max = 255;
    levelElem.append(levelEditInput);

    const actionElem = createTD("dl-action");

    // const editButton = document.createElement("button");
    // editButton.innerText = "Edit";
    // editButton.classList.add("dl-edit");

    const editButton = createButton("dl-edit", "Edit", async () => {
        elem.toggleAttribute("editing", true);
    });

    const saveButton = createButton("dl-save", "Save", async () => {
        const name = nameEditInput.value.trim();
        const level = parseInt(levelEditInput.value);
        // console.log("Name", name, "old", dl.name);
        // console.log("Level", level, "old", dl.level);
        if (name === dl.name && level === dl.level) {
            elem.toggleAttribute("editing", false);
            console.log("No change");
            return;
        }
        await updateDownload(dl.id, name, level);
        await updateDLList();
    });

    const cancelButton = createButton("dl-cancel", "Cancel", async () => {
        elem.toggleAttribute("editing", false);
        nameEditInput.value = dl.name;
        levelEditInput.value = dl.level;
    });

    const deleteButton = createButton("dl-delete", "Delete", async () => {
        const res = await deleteDownload(dl.id);
        console.log("Deleted", res);
        await updateDLList();
    });

    const uniqueButton = createButton("dl-unique", "Unique", async () => {
        //
    });

    const copyButton = createButton("dl-copy", "Copy", async () => {
        copyButton.toggleAttribute("copy", true);
        window.navigator.clipboard.writeText(createDLURL(dl.id));
        await waitForAnim(copyButton, { animName: "copy" });
        console.log("anim end");
        copyButton.toggleAttribute("copy", false);
    });

    const downloadButton = createButton("dl-download", "Download", () => {
        startDL(dl.id, dl.name);
    });

    actionElem.append(editButton, saveButton, cancelButton, deleteButton, uniqueButton, copyButton, downloadButton);

    elem.append(nameElem, pathElem, levelElem, sizeElem, creationElem, updateElem, actionElem);
    return elem;
}
