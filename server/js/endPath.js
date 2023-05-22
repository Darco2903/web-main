window.addEventListener("load", () => {
    if (!location.pathname.includes(".") && !location.pathname.endsWith("/")) {
        location.href += "/";
    }
});
