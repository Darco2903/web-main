import "/socket.io/socket.io.js";

/** @type {import("socket.io").Socket} */
const socket = io(window.origin, {
    autoConnect: true,
    query: {
        session_id: null,
        path: window.location.pathname,
    },
});

export { socket };
