import { createRouter, createWebHistory } from "vue-router";

const NotFound = () => import("@pages/NotFound.vue");
const Home = () => import("@pages/Home.vue");
const ProfileHome = () => import("@pages/Profile/ProfileHome.vue");
const ProfileEdit = () => import("@pages/Profile/Edit.vue");

const routes = [
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
            permission: 10,
        },
    },
    {
        path: "/profile/edit",
        name: "edit",
        component: ProfileEdit,
        meta: {
            title: "Profile Edit",
            permission: 10,
        },
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

router.beforeEach((to, from) => {
    document.title = to.meta?.title;
});
