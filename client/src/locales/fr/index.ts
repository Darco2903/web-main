import type { LocalesSchema } from "../types";

import * as common from "./common";
import AccountIndex from "./AccountIndex";
import Edit from "./Edit";
import Home from "./Home";
import LoginButton from "./LoginButton";
import NotFound from "./NotFound";
import ProfileHome from "./ProfileHome";

export default {
    common: {
        myProfile: common.myProfile,
        goHome: common.goHome,
    },
    accountIndex: AccountIndex,
    edit: Edit,
    home: Home,
    notFound: NotFound,
    loginButton: LoginButton,
    profileHome: ProfileHome,
} satisfies LocalesSchema;
