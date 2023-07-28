// 引入vue-router
import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import Chatroom from './components/pages/Chatroom.vue';


// 定義路由
const routes = [
    { 
        path: '/helloworld', 
        component: HelloWorld 
    },
    // // 首頁
    // { 
    //     path: '/', 
    //     component: HomePage
    // },
    // 文章頁
    { 
        path: '/chatroom', 
        component: Chatroom
    },
];

// 建立VueRouter
const router = createRouter({
    mode: 'history',
    history: createWebHistory(),
    routes, // short for `routes: routes`
});


export default {
    router
}