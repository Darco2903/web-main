import { Socket } from "socket.io";
import { User } from "auth-api";

type Cookies = {
    [key: string]: string;
    session_id: string;
};

declare module "socket.io" {
    interface Socket {
        getCookies(): Cookies;
        user: {
            session_id: string;
            info: User;
        };
    }
}
