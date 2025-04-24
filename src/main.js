import '@/assets/main.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createPersistedState } from 'pinia-persistedstate-plugin'
// 导入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

//导入路由
import router from '@/router/index.js'

import App from './App.vue'

const app =createApp(App);
const pinia = createPinia();
const persist=createPersistedState();
pinia.use(persist);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
app.use(pinia);