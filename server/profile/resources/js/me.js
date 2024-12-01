const iframe = document.querySelector("iframe");

const FAST_REDIRECT = false;

window.addEventListener("load", async () => {
    const user_id = getCookie("user_id");
    if (FAST_REDIRECT) window.location.replace(`./?user=${user_id}`); // fast redirect

    iframe.src = `./?user=${user_id}`;
    iframe.onload = () => {
        iframe.contentWindow.addEventListener("click", (e) => {
            if (e.target.href) {
                e.preventDefault();
                console.log("redirect", e.target.href);
                window.location.href = e.target.href;
            }
        });
    };
});
