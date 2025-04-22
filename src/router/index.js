import { createRouter, createWebHistory } from 'vue-router'

//导入组件
import RegisterVue from '@/views/user/Register.vue'
import LoginVue from '@/views/user/Login.vue'
import Home from '@/views/Home.vue'
import UserInfoVue from '@/views/user/Info.vue'

//定义路由
const routes = [
       { path: '/', component: Home },
       { path: '/register', component: RegisterVue },
       { path: '/login', component: LoginVue },
       { path: '/user', component: UserInfoVue }
]

//创建路由
const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

//导出路由
export default router