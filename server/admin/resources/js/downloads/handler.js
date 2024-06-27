import { createDLElem } from "./fileElem.js";
import { getDownloads } from "./requests.js";

const refreshButton = document.getElementById("refresh");

const dlListContainer = document.getElementById("dl-list-container");
const dlListContent = document.getElementById("dl-list-content");

export async function updateDLList() {
    if (dlListContainer.hasAttribute("loading")) return;
    dlListContainer.toggleAttribute("loading", true);
    const refresh = getDownloads();
    const anim = waitForAnim(refreshButton);
    try {
        const [dl] = await Promise.all([refresh, anim]);
        // console.log("dl", dl);
        const dlElem = dl.map(createDLElem);
        dlListContent.innerHTML = "";
        dlListContent.append(...dlElem);
    } catch (error) {
        console.error("Error", error.message);
        alert("Failed to fetch downloads");
    }
    dlListContainer.toggleAttribute("loading", false);
}
