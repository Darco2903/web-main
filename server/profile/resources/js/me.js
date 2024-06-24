const iframe = document.querySelector("iframe");

const FAST_REDIRECT = false;

window.addEventListener("load", async () => {
    const user_id = getCookie("user_id");
    if (FAST_REDIRECT) window.location.replace(`./?user=${user_id}`); // fast redirect

    iframe.src = `./?user=${user_id}`;
    iframe.onload = async () => {
        // await new Promise((resolve) => setTimeout(resolve, 100));
        // console.log("title", iframe.contentDocument.title);
        // document.title = iframe.contentDocument.title;

        iframe.contentDocument.querySelectorAll("a").forEach((a) => {
            a.addEventListener("click", (e) => {
                e.preventDefault();
                const href = e.target.href;
                window.location.href = href;
            });
        });
    };
});
