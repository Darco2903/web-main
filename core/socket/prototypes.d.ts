import { Socket } from "socket.io";
import { User } from "auth-api";

import { Cookies } from "../types";

declare module "socket.io" {
    interface Socket {
        getCookies(): Cookies;
        user: {
            session_id: string;
            level: number;
            info: User;
        };
    }
}
