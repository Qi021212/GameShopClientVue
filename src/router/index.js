import { createRouter, createWebHistory } from 'vue-router'

//导入组件
import LayoutVue from '@/views/Menu.vue'
import MainVue from '@/views/Main.vue'
import myGamesVue from '@/views/user/mygames.vue'
import cartVue from '@/views/order/cart.vue'
import checkoutVue from '@/views/order/checkout.vue'
import ordersVue from '@/views/order/orders.vue'

//定义路由
const routes = [
    // { path: '/signup', component: MerchantSignupVue },
    // { path: '/login', component: MerchantLoginVue },
    {
        path: '/', component: LayoutVue, redirect: '/main', children: [
            { path: '/main', component: MainVue },
            { path: '/my-games', component: myGamesVue },
            { path: '/cart', component: cartVue },
            { path: '/checkout', component: checkoutVue },
            { path: '/orders', component: ordersVue },
        ]
    }
]

//创建路由
const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

//导出路由
export default router