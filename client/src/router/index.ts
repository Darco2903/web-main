import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useStore as useUserStore } from "@store/user";

const NotFound = () => import("@pages/NotFound.vue");
const Layout = () => import("@pages/Layout.vue");
const Home = () => import("@pages/Home.vue");
const ProfileHome = () => import("@pages/Profile/ProfileHome.vue");
const ProfileEdit = () => import("@pages/Profile/Edit.vue");

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
                },
            },
        ],
    },
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

    if (!userStore.info) {
        await userStore.init();
    }

    const perm = to.meta?.permission;
    const user = userStore.info;

    if (perm) {
        if (!user) {
            console.log("User not logged in");
            alert("You need to be logged in to access this page");

            const url = new URL("/login", import.meta.env.VITE_AUTH_SERVER_ORIGIN);
            url.searchParams.append("redirect", window.location.origin + to.fullPath);
            // console.log("Redirecting to", url.href);
            window.location.replace(url.href);
        }
        // else if (perm > user.role && !(await api.auth()).result) {
        //     console.log("Permission denied");
        //     alert("You do not have permission to access this page");
        //     return { name: "Home" };
        // }
    }

    document.title = to.meta.title;
});
