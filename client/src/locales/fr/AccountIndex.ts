import type { AccountIndex } from "../types/AccountIndex";

import { myProfile } from "./common";

export default {
    ...myProfile,
    logout: "Déconnexion",
} satisfies AccountIndex;
