import { Stream } from "/js/stream.js";
const url = new URL(window.location.href);
const server = url.searchParams.get("server");
const consoleDiv = document.querySelector("div#console");
const content = document.querySelector("#console-content");
const commandInput = document.querySelector("div#input > input");
const commandButton = document.querySelector("div#input > button");
const errorDiv = document.querySelector("div#error");
const refreshButton = errorDiv.querySelector("button");
const errorLabel = errorDiv.querySelector("label");
const clearButton = document.querySelector("button#clear");
// const autoScrollButton = document.querySelector("button#auto-scroll");
const ansiUp = new AnsiUp();
let autoScroll;

/**
 * @param {boolean} state
 * @returns {void}
 */
function setAutoScroll(state) {
    autoScroll = state;
    // document.cookie = `auto_scroll=${state};path=${window.location.pathname}`;
}

if (!document.cookie.includes("auto_scroll")) {
    setAutoScroll(true);
} else {
    autoScroll = document.cookie.includes("auto_scroll=true");
}

const stream = new Stream(server, true);

window.addEventListener("beforeunload", () => {
    stream.close();
});

window.addEventListener("wheel", (event) => {
    // mouse wheel up
    if (event.deltaY < 0) {
        setAutoScroll(false);
        // autoScrollButton.removeAttribute("hidden");
    }
});

function scrollDown() {
    content.scrollTo(0, content.scrollHeight);
}

stream.onmessage = (message) => {
    console.log(message);
    enabledConsole(true);
    // content.innerHTML += message;
    let htmlText = ansiUp.ansi_to_html(message);
    htmlText = htmlText.replaceAll("&lt;br&gt;", "<br>");
    htmlText = htmlText.replaceAll("\t", "&nbsp;&nbsp;&nbsp;&nbsp;");
    htmlText = htmlText.replaceAll(" ", "&nbsp;");
    htmlText = htmlText.replaceAll("span&nbsp;", "span ");
    content.innerHTML += htmlText;
    if (autoScroll) {
        scrollDown();
    }
};

stream.onerror = (error) => {
    console.log(error);
    errorLabel.innerHTML = errorMessage(error);
    enabledConsole(false);
};

function errorMessage(error) {
    switch (error) {
        case "game-server-not-online":
            return "Game server is not reachable";

        case "no-query":
            return "No query provided";

        case "undefined-stream":
            return "Undefined stream";

        case "not-running":
            return "Server is not started";

        case "stream-not-found":
            return "Stream not found";

        default:
            return "Unknown error";
    }
}

commandInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && commandInput.value !== "") {
        console.log("ENTER");
        commandInput.value = "";
    }
});

refreshButton.addEventListener("click", () => {
    refreshButton.setAttribute("disabled", null);
    stream.refresh();
    content.innerHTML = "";
    setTimeout(() => {
        refreshButton.removeAttribute("disabled");
    }, 1000);
});

function enabledConsole(state) {
    if (state) {
        consoleDiv.removeAttribute("disabled");
        commandButton.removeAttribute("disabled");
        commandInput.removeAttribute("disabled");
        errorDiv.style.display = "none";
    } else {
        consoleDiv.setAttribute("disabled", null);
        commandButton.setAttribute("disabled", null);
        commandInput.setAttribute("disabled", null);
        errorDiv.style.display = null;
    }
}

clearButton.addEventListener("click", () => {
    content.innerHTML = "";
});
