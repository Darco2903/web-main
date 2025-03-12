import express from "express";
import { logInfo } from "logger";

import ping from "./controllers/ping.js";

const router = express.Router();
export default router;

router.get("/ping", ping);
