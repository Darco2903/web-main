import type { ProfileHome } from "../types/ProfileHome";

import { myProfile } from "./common";

export default {
    ...myProfile,
    otherProfile: "{username}'s Profile",
    editProfile: "Edit Profile",
    emailUnverified: "Email Unverified",
    verifyNow: "Verify Now",
    loginRequired: "You must be logged in to view your profile",
    noUserId: "No user id found",
    invalidUserId: "Invalid User ID.",
    failedToLoadUser: "Failed to load user.",
} satisfies ProfileHome;
