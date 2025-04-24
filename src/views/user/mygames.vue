<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/UserInfo';
const tokenStore = useTokenStore();

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


// 游戏数据
const games = ref([])
// 获取游戏数据
import { getGameList } from '@/api/user.js'
const fetchGameList = async () => {
    try {
        const response = await getGameList(localUserInfo.value.id); // 假设13是用户ID
        console.log('API响应:', response); // 调试用

        // 修正1：正确处理嵌套结构
        const gameItems = response.items;
        console.log('游戏列表:', gameItems); // 调试用

        if (gameItems.length > 0) {
            games.value = gameItems.map(game => ({
                itemId: game.itemId,
                itemName: game.itemName,
                picture1: game.picture1 ? `http://localhost:8080/images/${game.picture1}` : '/src/assets/loading.png'
            }));
        } else {
            ElMessage.warning('您的游戏库为空');
        }
    } catch (error) {
        console.error('获取游戏数据失败:', error);
        ElMessage.error('加载游戏数据失败，请稍后重试');
    }
};
// 图片加载失败处理
const handleImageError = (event) => {
    event.target.src = 'https://via.placeholder.com/460x215?text=Game+Cover'
}

// 查看游戏详情
const viewGameDetails = (gameId) => {
    router.push(`/products/${gameId}`)
}

onMounted(() => {
    fetchGameList();
    getUserInfo();
})
</script>

<template>
    <div class="simple-game-library">
        <h2 class="library-title">我的游戏库</h2>

        <div class="games-container">
            <div v-for="game in games" :key="game.itemId" class="game-item" @click="viewGameDetails(game.itemId)">
                <div class="game-image-wrapper">
                    <img :src="game.picture1" :alt="game.itemName" class="game-image" @error="handleImageError">
                </div>
                <div class="game-name">{{ game.itemName }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.simple-game-library {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.library-title {
    font-size: 24px;
    color: #ffffff;
    margin-bottom: 20px;
    text-align: center;
}

.games-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    padding: 10px;
}

.game-item {
    cursor: pointer;
    transition: transform 0.2s;
}

.game-item:hover {
    transform: translateY(-5px);
}

.game-image-wrapper {
    position: relative;
    padding-top: 56.25%;
    /* 16:9 宽高比 */
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #f5f5f5;
}

.game-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.game-item:hover .game-image {
    transform: scale(1.05);
}

.game-name {
    margin-top: 10px;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #ffffff;
}

@media (max-width: 768px) {
    .games-container {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
    }

    .game-name {
        font-size: 14px;
    }
}

@media (max-width: 480px) {
    .games-container {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>