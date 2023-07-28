import { createApp } from 'vue';
import App from './App.vue';
import './css/style.css';
import router from './router';

const app = createApp(App);

// 將vue-router傳遞給vue app
app.use(router.router);
//引入
app.mount('#app')