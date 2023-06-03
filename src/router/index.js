import Vue from "vue";
import VueRouter from 'vue-router'

Vue.use(VueRouter);


// 定义路由关系
const routes = [
    {
        path: '/',
        name: "ImageViewer",
        component: () => import("../components/ImageViewer.vue")
    },
    {
        path: "/flipper",
        name: "flipper",
        component: () => import("../components/ImageFlipper.vue")
    },
    {
        path: "/list",
        name: "list",
        component: () => import("../components/ImageList.vue")
    },
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});


export default router;