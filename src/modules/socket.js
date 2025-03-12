import { io } from "socket.io-client";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

export const socket = io(window.origin, {
    autoConnect: true,
    query: {
        session_id: null,
        // path: window.location.pathname,
    },
});

socket.on("connect", () => {
    console.log("socket connected");
});

socket.on("disconnect", () => {
    console.log("socket disconnected");
});
