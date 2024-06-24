import AuthAPI from "../../../../resources/js/utils/AuthApi.js";
import { initUserSession } from "../../../../resources/js/upper-panel.js";
import { loadImage, resizeGif, resizeImage } from "./image.js";

const imageSection = document.getElementById("image-section");
/** @type {HTMLInputElement} */
const imageInput = document.getElementById("image-input");
/** @type {HTMLImageElement} */
const userImage = document.getElementById("user-image");
const imageInputContainer = document.getElementById("image-input-container");
const imageRoundBorderCheckbox = document.getElementById("image-round-border-input");
const imageRemoveButton = document.getElementById("image-remove");
const imageSaveButton = document.getElementById("image-save");
const imageCancelButton = document.getElementById("image-cancel");

const usernameSection = document.getElementById("username-section");
/** @type {HTMLInputElement} */
const usernameInput = document.getElementById("username-input");
const usernameSaveButton = document.getElementById("username-save");
const usernameCancelButton = document.getElementById("username-cancel");

// /** @type {HTMLInputElement} */
// const emailInput = document.getElementById("email-input");

function isImageEdited() {
    const sameImg = userImage.src === userImage.dataset.original;
    const sameBorder = imageRoundBorderCheckbox.checked.toString() === imageRoundBorderCheckbox.dataset.original;
    return !sameImg || !sameBorder;
}

/**
 * @param {File} file
 * @returns {Promise<void>}
 */
async function updateImage(file) {
    imageSection.toggleAttribute("edited", true);

    const image = await loadImage(file);
    // console.log("Resizing image", image);
    const resizedImage = await resizeImage(image, file.type);
    // const resizedImage = await resizeGif(image);
    // console.log("Resized image", resizedImage);
    userImage.src = URL.createObjectURL(resizedImage);
}

imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    // console.log("Image", file);
    if (!file) return;

    await updateImage(file);
});

/** @type {Set<number>} */
const dragoverTimeouts = new Set();

imageInputContainer.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();

    dragoverTimeouts.forEach((t) => clearTimeout(t));
    dragoverTimeouts.clear();
    imageInputContainer.toggleAttribute("drag-over", true);
});

imageInputContainer.addEventListener("dragleave", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const t = setTimeout(() => {
        dragoverTimeouts.delete(t);
        imageInputContainer.toggleAttribute("drag-over", false);
    }, 50);
    dragoverTimeouts.add(t);
});

imageInputContainer.addEventListener("drop", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    imageInputContainer.toggleAttribute("drag-over", false);

    const file = event.dataTransfer.files[0];

    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
        alert("Unsupported file type");
        return;
    }

    await updateImage(file);
});

imageRoundBorderCheckbox.addEventListener("change", async () => {
    // console.log("Round border", imageRoundBorderCheckbox.checked);
    imageSection.toggleAttribute("round-border", imageRoundBorderCheckbox.checked);
    const edited = isImageEdited();
    imageSection.toggleAttribute("edited", edited);
});

imageRemoveButton.addEventListener("click", async () => {
    userImage.removeAttribute("src");
    const edited = isImageEdited();
    imageSection.toggleAttribute("edited", edited);
});

imageSaveButton.addEventListener("click", async () => {
    imageSection.toggleAttribute("disabled", true);

    let res;
    const roundBorder = imageRoundBorderCheckbox.checked;

    if (!userImage.src) {
        console.log("Deleting image");
        res = await AuthAPI.user.picture.profile.delete(roundBorder);
    } else {
        console.log("Uploading image", userImage.src);
        const file = await fetch(userImage.src).then((res) => res.blob());
        res = await AuthAPI.user.picture.profile.update(file, roundBorder);
    }

    console.log("Response", res);

    if (!res.result) {
        alert("Error updating profile picture");
        console.error(res.error);
    } else {
        console.log("success", userImage.src);
        userImage.dataset.original = userImage.src;
        imageRoundBorderCheckbox.dataset.original = roundBorder;
        imageSection.toggleAttribute("edited", false);
        await initUserSession();
    }

    await wait(500);
    imageSection.toggleAttribute("disabled", false);
});

imageCancelButton.addEventListener("click", () => {
    userImage.src = userImage.dataset.original;
    imageRoundBorderCheckbox.checked = imageRoundBorderCheckbox.dataset.original === "true";
    imageRoundBorderCheckbox.dispatchEvent(new Event("change"));
    imageSection.toggleAttribute("edited", false);
});

usernameInput.addEventListener("input", () => {
    const username = usernameInput.value;
    const edited = username !== usernameInput.dataset.original;
    usernameSection.toggleAttribute("edited", edited);
});

usernameSaveButton.addEventListener("click", async () => {
    usernameSection.toggleAttribute("disabled", true);

    const username = usernameInput.value;
    if (username === usernameInput.dataset.original) return;

    console.log("Saving username", username);

    // const res = await updateUsername(username);
    const res = await AuthAPI.user.username(username);

    // console.log("Response", res.status, res.statusText);

    if (res.result) {
        usernameSection.toggleAttribute("edited", false);
        usernameInput.dataset.original = username;
        await initUserSession();
    } else {
        let message = "";
        switch (res.error) {
            case "USERNAME_EXISTS":
                message = "Username already exists";
                break;
            case "USERNAME_TOO_SHORT":
                message = "Username is too short";
                break;
            case "USERNAME_TOO_LONG":
                message = "Username is too long";
                break;
            default:
                message = "Error updating username";
                break;
        }
        alert(message);
    }

    await wait(500);
    usernameSection.toggleAttribute("disabled", false);
});

usernameCancelButton.addEventListener("click", () => {
    usernameInput.value = usernameInput.dataset.original;
    usernameSection.toggleAttribute("edited", false);
});

window.addEventListener("load", async () => {
    document.body.setAttribute("theme", "dark");

    const user_id = getCookie("user_id");
    const { user } = await AuthAPI.user.id(user_id);
    // console.log("User", user);

    const img = await AuthAPI.user.picture.profile.get(user_id);
    if (img.size > 0) userImage.src = URL.createObjectURL(img);
    userImage.dataset.original = userImage.src;

    imageRoundBorderCheckbox.checked = user.round_border;
    imageRoundBorderCheckbox.dataset.original = user.round_border;
    imageRoundBorderCheckbox.dispatchEvent(new Event("change"));

    usernameInput.value = user.name;
    usernameInput.dataset.original = user.name;

    // emailInput.value = user.email;

    window.addEventListener("beforeunload", (event) => {
        if (isImageEdited() || usernameSection.hasAttribute("edited")) {
            event.preventDefault();
            event.returnValue = "";
        }
    });
});
