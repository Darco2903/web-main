import { reqHandler } from "../../utils.js";

export default reqHandler((req, res) => {
    res.status(200).send("pong");
});
