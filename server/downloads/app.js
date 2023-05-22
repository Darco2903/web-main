const DOWNLOADS_PATH = window.location.pathname + "storage";
const filesContent = document.querySelector("#files-content");
const fileTemplate = document.querySelector("#template>.file");

function createFileDiv() {
    const div = fileTemplate.cloneNode(true);
    div.img = div.querySelector("img");
    div.a = div.querySelector("a");
    div.button = div.querySelector("button");
    return div;
}

async function getFiles() {
    const res = await fetch("/php/getFiles.php?" + new URLSearchParams({ path: DOWNLOADS_PATH.substring(1) }));
    const text = await res.text();

    if (res.ok) {
        const files = text.split("\n");

        files.forEach((file) => {
            const fileDiv = createFileDiv();
            // fileDiv.img.src = file;
            fileDiv.a.href = `${DOWNLOADS_PATH}/${file}`;
            fileDiv.button.innerText = file;
            filesContent.appendChild(fileDiv);
        });
    } else {
        console.error(text);
    }
}

getFiles();
