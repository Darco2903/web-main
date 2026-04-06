import * as common from "./common";
import type { AccountIndex } from "./AccountIndex";
import type { Edit } from "./Edit";
import type { Home } from "./Home";
import type { LoginButton } from "./LoginButton";
import type { NotFound } from "./NotFound";
import type { ProfileHome } from "./ProfileHome";

export type LocalesSchema = {
    common: {
        myProfile: common.MyProfile;
        goHome: common.GoHome;
    };
    accountIndex: AccountIndex;
    edit: Edit;
    home: Home;
    loginButton: LoginButton;
    notFound: NotFound;
    profileHome: ProfileHome;
};

export enum Locale {
    EN = "en",
    FR = "fr",
}
