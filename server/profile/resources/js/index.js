import AuthAPI from "../../../resources/js/utils/AuthApi.js";

const userImageContainer = document.getElementById("user-image-container");
const userImage = document.getElementById("user-image");
const usernameLabel = document.getElementById("user-name");

window.addEventListener("load", async () => {
    const params = new URLSearchParams(window.location.search);
    let user_id = params.get("user");

    if (!user_id) user_id = getCookie("user_id");
    console.log(user_id);
    const { result, user, error } = await AuthAPI.user.id(user_id);
    console.log(result, user, error);

    if (error) {
        alert("User not found!");
        return;
    }

    document.title = `${user.name}'s Profile`;

    const isOwner = getCookie("user_id") === user_id;
    document.body.toggleAttribute("own-profile", isOwner);

    await AuthAPI.user.picture.profile
        .get(user_id)
        .then((blob) => {
            if (blob.size === 0) return;
            userImage.src = URL.createObjectURL(blob);
        })
        .catch((err) => {
            console.error("Unable to load profile picture", err);
        });

    userImageContainer.toggleAttribute("round-border", user.round_border);

    usernameLabel.innerText = user.name;
});
