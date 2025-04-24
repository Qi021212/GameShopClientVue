import { createRouter, createWebHistory } from 'vue-router'

//导入组件
import Home from '@/views/Home.vue'
import RegisterVue from '@/views/user/Register.vue'
import LoginVue from '@/views/user/Login.vue'
import UserInfoVue from '@/views/user/Info.vue'

import LayoutVue from '@/views/Menu.vue'
import myGamesVue from '@/views/user/mygames.vue'

import ProductPreview from '@/views/products/ProductPreview.vue'
import ProductDetail from '@/views/products/ProductDetail.vue'
import ProductCategory from '@/views/products/ProductCategory.vue'

import cartVue from '@/views/order/cart.vue'
import checkoutVue from '@/views/order/checkout.vue'
import ordersVue from '@/views/order/orders.vue'

//定义路由
const routes = [
    { path: '/home', component: Home },
    { path: '/register', component: RegisterVue },
    { path: '/login', component: LoginVue },
    
    {
        path: '/', component: LayoutVue, redirect: '/products', children: [
            { path: '/my-games', component: myGamesVue },
            { path: '/products', component: ProductPreview },
            { path: '/products/:id', component: ProductDetail, props: true },// 分类商品页
            { path: '/products/category/:category', component: ProductCategory, props: true },//分类导航
            { path: '/cart', component: cartVue },
            { path: '/checkout', component: checkoutVue },
            { path: '/orders', component: ordersVue },
            { path: '/user', component: UserInfoVue },
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
