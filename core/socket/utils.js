function getCallback(args) {
    return typeof args[args.length - 1] === "function" ? args.pop() : () => {};
}

function socketHandler(fn) {
    return fn;
}

module.exports = {
    getCallback,
    socketHandler,
};
