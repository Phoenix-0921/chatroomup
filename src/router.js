// 引入vue-router
import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import Chatroom from './components/pages/Chatroom.vue';
import test from './components/pages/test.vue';
import test2 from './components/pages/test2.vue';

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
    { 
        path: '/test', 
        component: test
    },
    { 
        path: '/test2', 
        component: test2
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