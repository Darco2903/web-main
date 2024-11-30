const http = require("http");

http.IncomingMessage.prototype.getBody = async function () {
    return new Promise((resolve, reject) => {
        let body = "";
        this.on("data", (chunk) => (body += chunk));
        this.on("end", () => resolve(body));
        this.on("error", reject);
    });
};

http.IncomingMessage.prototype.getCookies = function () {
    return Object.fromEntries(
        this.headers?.cookie?.split("; ").map((cookie) => {
            const [key, value] = cookie.split("=");
            return [key, value];
        }) ?? []
    );
};

http.ServerResponse.prototype.setCookie = function (name, value, options = {}) {
    this.setHeader("Set-Cookie", createCookie(name, value, options));
};

http.ServerResponse.prototype.endJSON = function (data) {
    this.setHeader("Content-Type", "application/json");
    this.end(JSON.stringify(data));
};
