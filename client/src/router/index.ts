import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { UserRole } from "@darco2903/auth-api/client";
import { useStore as useUserStore } from "@store/user";
import { useConfirmStore } from "@store/ui";
import { AUTH_SERVER_ORIGIN } from "@mod/config";

const NotFound = () => import("@pages/NotFound.vue");
const Layout = () => import("@pages/Layout.vue");
const Home = () => import("@pages/Home.vue");
const ProfileHome = () => import("@pages/Profile/ProfileHome.vue");
const ProfileEdit = () => import("@pages/Profile/Edit.vue");

const devRoutes: RouteRecordRaw[] = [
    {
        path: "/design",
        component: () => import("@pages/Design.vue"),
        meta: {
            title: "Design",
        },
    },
];

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "Layout",
        component: Layout,
        children: [
            {
                path: "/",
                name: "home",
                component: Home,
                meta: {
                    title: "Home",
                },
            },
            {
                path: "/profile/:id",
                name: "profile",
                component: ProfileHome,
                meta: {
                    title: "Profile",
                },
            },
            {
                path: "/profile/edit",
                name: "edit",
                component: ProfileEdit,
                meta: {
                    title: "Profile Edit",
                    permission: UserRole.Newbie,
                },
            },
        ],
    },

    ...(import.meta.env.DEV ? devRoutes : []),

    {
        path: "/:catchAll(.*)",
        component: NotFound,
        meta: {
            title: "Not Found",
        },
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to) => {
    const userStore = useUserStore();
    const confirmStore = useConfirmStore();

    // Only requests the first time, logged out visitors don't retry on every navigation
    await userStore.init();

    const perm = to.meta?.permission;
    const user = userStore.info;

    if (perm !== undefined) {
        if (!user) {
            console.log("User not logged in");
            await confirmStore.alert("You need to be logged in to access this page");

            const url = new URL("/login", AUTH_SERVER_ORIGIN);
            url.searchParams.append("redirect", window.location.origin + to.fullPath);
            window.location.replace(url.href);
            // Cancel the navigation, the page must not render while the browser leaves
            return false;
        } else if (user.role < perm) {
            console.log("Permission denied");
            await confirmStore.alert("You do not have permission to access this page");
            return { name: "home" };
        }
    }

    document.title = to.meta.title;
});
