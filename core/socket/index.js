const { Server: ioServer } = require("socket.io");

const { server } = require("../server/index");

require("./prototypes");

const io = new ioServer(server, {
    // maxHttpBufferSize: 2 * 1e8, // 200 MB
    // pingTimeout: 60000,
});

module.exports = {
    io,
};

// const { logInfo } = require("logger");
// const { io } = require("../index");

// const filetransfer = require("./filetransfer");

// const onConnection = (socket) => {
//     filetransfer(io, socket);
// };

// io.on("connection", onConnection);
