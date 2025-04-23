// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import ProductPreview from '@/views/products/ProductPreview.vue'
import ProductDetail from '@/views/products/ProductDetail.vue'
import ProductCategory from '@/views/products/ProductCategory.vue'
import LayoutVue from '@/views/Menu.vue'


// 路由配置
const routes = [
    {
        path: '/', component: LayoutVue, redirect: '/products', children: [
            { path: '/products', component: ProductPreview },
            { path: '/products/:id', component: ProductDetail, props: true },// 分类商品页
            { path: '/products/category/:category', component: ProductCategory, props: true },//分类导航
        ]
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(), // 使用HTML5 history模式
    routes
})

export default router