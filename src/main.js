import './assets/main.css'

import { createApp } from 'vue'
// 导入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

//导入路由
import router from './router/index.js'

import App from './App.vue'

const app =createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app')