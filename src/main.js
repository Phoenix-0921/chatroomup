import { createApp } from 'vue';
import App from './App.vue';
import './css/style.css';
import router from './router';
// main.js 或者你 Vite 專案的其他入口文件


const app = createApp(App);

// 將vue-router傳遞給vue app
app.use(router.router);
//引入
app.mount('#app')