import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'

// 初始化应用实例
const app = createApp(App)
const pinia = createPinia()

// 按正确顺序注册插件
app.use(router)
app.use(ElementPlus)
app.use(pinia)

// 最后挂载
app.mount('#app')