<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 游戏数据 - 只包含图片和名称
const games = ref([
    {
        id: 1,
        name: '赛博朋克2077',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg'
    },
])

// 图片加载失败处理
const handleImageError = (event) => {
    event.target.src = 'https://via.placeholder.com/460x215?text=Game+Cover'
}

// 查看游戏详情
const viewGameDetails = (gameId) => {
    router.push(`/games/${gameId}`)
}
</script>

<template>
    <div class="simple-game-library">
        <h2 class="library-title">我的游戏库</h2>

        <div class="games-container">
            <div v-for="game in games" :key="game.id" class="game-item" @click="viewGameDetails(game.id)">
                <div class="game-image-wrapper">
                    <img :src="game.image" :alt="game.name" class="game-image" @error="handleImageError">
                </div>
                <div class="game-name">{{ game.name }}</div>
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