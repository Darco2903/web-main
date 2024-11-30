const AuthApi = require("auth-api");
const { colors, logInfo, logError } = require("logger");

const { io } = require("./index");

const downloads = require("./handler/downloads/index");

io.use(async (socket, next) => {
    // console.log("Middleware");

    const { session_id } = socket.getCookies();

    // console.log("session_id", session_id);

    socket.user = {};

    if (session_id) {
        const res = await AuthApi.user.session(session_id);
        if (res.error) {
            logError("Auth:", res.error);
        } else if (res.result) {
            socket.user.info = res.user;
            socket.user.session_id = session_id;
        }
    }

    // console.log("socket.user", socket.user);

    // if (!session_id || !auth || true) {
    //     socket.emit("unauthorized");
    //     socket.disconnect(true);
    //     next(new Error("Unauthorized"));
    // }

    next();
}).on("connection", async (socket) => {
    const socketAddr = socket.handshake.address;
    const socketPath = socket.handshake.query.path;

    logInfo(colors.green(socketAddr), colors.yellow("   SOCKET"), colors.cyan(socketPath));

    if (socketPath === "/downloads/") {
        downloads(socket);
    }

    if (socketPath === "/filetransfert") {
        filetransfert(socket);
    }

    socket.on("disconnect", () => {
        logInfo(colors.green(socketAddr), colors.yellow("   SOCKET"), colors.cyan(socketPath), colors.red("DISCONNECTED"));
    });
});
