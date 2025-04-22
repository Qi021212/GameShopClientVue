<script setup>
import { ElMenu, ElMenuItem, ElSubMenu, ElInput, ElIcon, ElMessageBox } from 'element-plus';
import { useRouter,useRoute} from 'vue-router';
import { getProductsList} from '@/api/product.js';
import{ Search } from '@element-plus/icons-vue';
import { ref,computed,onMounted} from 'vue'

const router = useRouter();
const route = useRoute();
const allProducts = ref([]);
const loading = ref(false)
// 退出登录功能
const handleLogout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        router.push('/login')
    })
}
// 获取所有商品数据
const fetchProducts = async () => {
    try {
        const response = await getProductsList()
        allProducts.value = Array.isArray(response) ? response : response?.data || [];
    } catch (error) {
        ElMessage.error('商品加载失败')
        console.error('API Error:', error)
    } finally {
        loading.value = false
    }
}
// 计算属性：提取唯一分类
const categories = computed(() => {
    const unique = new Set(allProducts.value.map(p => p.category))
    return ['全部', ...Array.from(unique).sort()]
})

// 当前激活分类
const activeCategory = computed(() => {
    return route.name === 'ProductPreview'
        ? '全部'
        : decodeURIComponent(route.params.category)
})
// 处理分类选择
const handleSelect = (category) => {
    if (category === '全部') {
        router.push('/products')
    } else {
        router.push(`/products/category/${category}`)
    }
}
// 初始数据加载
onMounted(fetchProducts)
// const handleSelect = (key) => {
//     console.log('选中菜单:', key)
// }
</script>

<template>
    <div class="header-container">
        <el-menu :default-active="route.path" class="main-menu" mode="horizontal" background-color="#171D25"
            text-color="#efefef" active-text-color="#0077FF" @select="handleSelect" router>
            <!-- 左侧菜单项 -->
            <div class="left-section">
                <img src="/src/assets/logo.png" alt="游戏商店" class="site-logo">
                <span class="site-name">GameShop</span>

                <el-menu-item index="/main">首页</el-menu-item>

                <el-sub-menu index="category">
                    <template #title>游戏分类</template>

                    <el-menu-item v-for="category in categories" :key="category" :index="category"
                        @click="handleSelect(category)">
                        {{ category }}
                        <el-icon v-if="category === activeCategory" class="active-icon">
                            <Select />
                        </el-icon>
                    </el-menu-item>

                </el-sub-menu>

                <el-menu-item index="/cart">购物车</el-menu-item>
                <el-menu-item index="/orders">我的订单</el-menu-item>
            </div>

            <!-- 右侧功能区 -->
            <div class="right-section">
                <el-input placeholder="搜索游戏..." class="search-bar" clearable>
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>

                <el-sub-menu index="user-center">
                    <template #title>
                        <!-- <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" /> -->
                        <span class="user-name">用户名</span>
                    </template>
                    <el-menu-item index="my-games">我的游戏库</el-menu-item>
                    <el-menu-item index="settings">账户设置</el-menu-item>
                    <el-menu-item index="logout" @click="handleLogout">退出登录</el-menu-item>
                </el-sub-menu>
            </div>
        </el-menu>
    </div>
    <div>
        <router-view></router-view>
    </div>
</template>

<style scoped>
.header-container {
    width: 100%;
    background: #171D25;
}

.main-menu {
    display: flex;
    justify-content: space-between;
    height: 64px;
    padding: 0 5%;
    border-bottom: none;
}

/* 左侧菜单样式 */
.left-section {
    display: flex;
    align-items: center;
    gap: 30px;
}

.site-logo {
    height: 70px;
    width: 70px;
}

.site-name {
    color: #efefef;
    font-size: 1.4rem;
    font-weight: bold;
    margin-right: 20px;
}

/* 右侧功能区样式 */
.right-section {
    display: flex;
    align-items: center;
    gap: 30px;
}

.search-bar {
    width: 280px;
}

.user-name {
    margin-left: 8px;
    font-size: 0.95rem;
}

/* 菜单项通用样式 */
.el-menu-item,
.el-sub-menu__title {
    height: 64px;
    line-height: 64px;
    padding: 0 18px;
}

/* 选中颜色改变 */
.el-menu-item.is-active,
.el-sub-menu.is-active .el-sub-menu__title {
    color: #0077FF !important;
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
    color: #0077FF !important;
}

/* 下拉菜单样式 */
.el-sub-menu .el-menu-item {
    height: 48px;
    line-height: 48px;
    min-width: 140px;
}
</style>