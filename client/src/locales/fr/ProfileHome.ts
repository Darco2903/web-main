import type { ProfileHome } from "../types/ProfileHome";

import { myProfile } from "./common";

export default {
    ...myProfile,
    otherProfile: "Profil de {username}",
    editProfile: "Editer le profil",
    emailUnverified: "Email Non Verifié",
    verifyNow: "Vérifier Maintenant",
    loginRequired: "Vous devez être connecté pour voir votre profil",
    noUserId: "Aucun ID Utilisateur.",
    invalidUserId: "ID Utilisateur Invalide.",
    failedToLoadUser: "Échec du chargement de l'utilisateur.",
} satisfies ProfileHome;
