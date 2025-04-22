// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import ProductPreview from '@/views/products/ProductPreview.vue'
import ProductDetail from '@/views/products/ProductDetail.vue'
import ProductCategory from '@/views/products/ProductCategory.vue'
import CatageryNav from '../components/CatageryNav.vue'
// 路由配置
const routes = [
    {
        path: '/',
        redirect: '/products'
    },
    {
        path: '/products',
        name: 'ProductPreview',  // 路由名称（用于编程式导航）
        component: ProductPreview
    },
    {
        path: '/products/:id', // 动态路由参数
        name: 'ProductDetail',
        component: ProductDetail,
        props: true // 将路由参数作为props传递给组件
    },// 分类商品页

    {
        path: '/products/category',
        name: 'CataeryNav',
        component: CatageryNav,

    },
    {
        path: '/products/category/:category',
        name: 'ProductCategory',
        component: ProductCategory,
        props: true
    },//分类导航

]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(), // 使用HTML5 history模式
    routes
})

export default router