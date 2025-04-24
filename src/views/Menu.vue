<script setup>
import { ref, onMounted,computed } from 'vue';
import { ElMenu, ElMenuItem, ElSubMenu, ElMessageBox,ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
const router = useRouter();
const route = router.currentRoute;

import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/UserInfo';
const tokenStore = useTokenStore();
const userInfoStore = useTokenStore();

const localUserInfo = ref({
    id: useUserInfoStore().info.id,
    username: useUserInfoStore().info.username,
    email: useUserInfoStore().info.email
});


const getUserInfo = async () => {
    if (!tokenStore.isAuthenticated) {
        ElMessage.error('请先登录');
        router.push('/login');
        return;
    }
    console
    try {
        const id = useUserInfoStore().info.id; 
        if (!id || isNaN(id)) {
            ElMessage.error('无法获取ID，请重新登录');
            router.push('/');
            return;
        }
        await useUserInfoStore().fetchUserInfo(id);
        localUserInfo.value = JSON.parse(JSON.stringify(useUserInfoStore().info));
    } catch (error) {
        ElMessage.error('获取信息失败');
    }
};

onMounted(() => {
    getUserInfo();
});

// 退出登录功能
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    // 清除token和用户信息
    tokenStore.removeToken();
    userInfoStore.removeInfo();
    
    // 跳转到登录页
    router.push('/login');
  } catch (error) {
    // 用户点击了取消
    console.log('取消退出登录');
  }
}

</script>

<template>
    <div class="header-container">
        <el-menu :default-active="route.path" class="main-menu" mode="horizontal" background-color="#171D25"
            text-color="#efefef" active-text-color="#0077FF"  router>
            <!-- 左侧菜单项 -->
            <div class="left-section">
                <img src="/src/assets/logo.png" alt="游戏商店" class="site-logo">
                <span class="site-name">GameShop</span>

                <el-menu-item index="/">首页</el-menu-item>

                <el-sub-menu index="category" @select="handleSelect">
                    <template #title>游戏分类</template>
                    <el-menu-item index="/products/category/action">动作</el-menu-item>
                    <el-menu-item index="/products/category/adventure">冒险</el-menu-item>
                    <el-menu-item index="/products/category/casul">休闲</el-menu-item>
                    <el-menu-item index="/products/category/role">角色扮演</el-menu-item>
                    <el-menu-item index="/products/category/simulation">模拟</el-menu-item>
                    <el-menu-item index="/products/category/sports">体育及竞速</el-menu-item>
                </el-sub-menu>

                <el-menu-item index="/cart">购物车</el-menu-item>
                <el-menu-item index="/orders">我的订单</el-menu-item>
            </div>

            <!-- 右侧功能区 -->
            <div class="right-section">

                <el-sub-menu index="user-center">
                    <template #title>
                        <span class="user-name">{{ localUserInfo.username }}</span>
                    </template>
                    <el-menu-item index="my-games">我的游戏库</el-menu-item>
                    <el-menu-item index="user">账户设置</el-menu-item>
                    <el-menu-item @click="handleLogout">退出登录</el-menu-item>
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