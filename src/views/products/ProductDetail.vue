<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElCard, ElImage, ElButton, ElSelect, ElOption, ElDivider, ElTag, ElMessage, ElInput, ElPagination, ElEmpty } from 'element-plus';
import { ShoppingCart, Wallet } from '@element-plus/icons-vue';
import { getProductDetail, addProductComment } from '@/api/product.js';
import { addToCart } from '@/api/cart.js';

const route = useRoute();
const router = useRouter();

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

const selectedEdition = ref(null);
const loading = ref(false);
const userId = ref(localUserInfo.value.id); 

const product = ref([]);
// 图片展示
const activeImageIndex = ref(0);
const actualPictureKeys = computed(() => {
  if (!product.value) return [];
  const keys = [];
  for (let i = 1; i <= 5; i++) {
    const key = `picture${i}`;
    if (product.value[key]?.trim()) keys.push(key);
  }
  return keys;
});

// 分类映射
const categoryMap = {
  action: '动作',
  adventure: '冒险',
  casual: '休闲',
  role: '角色扮演',
  simulation: '模拟',
  sports: '体育',
};

// 评论相关
const newComment = ref('');
const commentsPerPage = 4;
const currentCommentPage = ref(1);
const paginatedComments = computed(() => {
  const start = (currentCommentPage.value - 1) * commentsPerPage;
  return product.value.comments?.slice(start, start + commentsPerPage) || [];
});

const fetchProductDetail = async () => {
  try {
    const { id } = route.params;
    if (!id) return ElMessage.error('商品ID缺失');

    const data = await getProductDetail(id);
    product.value = {
      ...data,
      comments: data.comments || [],
      editions: data.editions || []
    };
  } catch (error) {
    ElMessage.error('获取商品详情失败');
  }
};

const handleAddToCart = async () => {
  try {
    if (!selectedEdition.value) {
      return ElMessage.warning('请选择商品版本');
    }

    loading.value = true;
    await addToCart({
      userId: userId.value,
      itemId: product.value.id,
      editionId: selectedEdition.value.id,
      price: selectedEdition.value.price
    });

    ElMessage.success('已加入购物车');
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '添加失败');
  } finally {
    loading.value = false;
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) {
    return ElMessage.warning('请输入评论内容');
  }

  try {
    await addProductComment(route.params.id, newComment.value.trim(), userId.value);
    await fetchProductDetail(route.params.id);
    ElMessage.success('评论发表成功');
    newComment.value = '';
  } catch (error) {
    ElMessage.error('评论提交失败');
  }
};

const toggleLike = (index) => {
  const comment = product.value.comments[index];
  comment.likeActive = !comment.likeActive;
  comment.like = comment.likeActive ? (comment.like || 0) + 1 : (comment.like || 1) - 1;
};

onMounted(() => {
  fetchProductDetail();
  getUserInfo();
})
</script>

<template>
  <div class="product-detail-container">
    <!-- 商品主区域 -->
    <el-card class="product-card" shadow="never">
      <div class="product-main">
        <!-- 商品图片区域 -->
        <div class="product-gallery">
          
          <div class="main-image">
            <el-image v-if="actualPictureKeys.length > 0"
              :src="`http://localhost:8080/images/${product[actualPictureKeys[activeImageIndex]]}`" fit="contain"
              class="product-image" />
            <el-empty v-else description="暂无图片" />
          </div>

          <div class="thumbnail-list">
            <div v-for="(picKey, index) in actualPictureKeys" :key="picKey" class="thumbnail-item"
              :class="{ active: activeImageIndex === index }" @mouseenter="activeImageIndex = index">
              <el-image :src="`http://localhost:8080/images/${product[picKey]}`" fit="cover" class="thumbnail-img" />
            </div>
          </div>
        </div>

        <!-- 商品信息区域 -->
        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          <div class="meta-section">
            <el-tag type="info" class="category-tag">{{ categoryMap[product.category] || product.category }}</el-tag>
          </div>
          <div class="price-section">
            <span class="price-label">价格:</span>
            <span class="price-value">￥{{ product.price }}起</span>
          </div>
          <el-divider />

          <div class="description-section">
            <h3>商品描述</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="type-section">
            <h3>商品类型</h3>
            <p>{{ product.type }}</p>
          </div>

          <div class="storage-section">
            <h3>库存情况</h3>
            <p>{{ product.storage }}件</p>
          </div>

          <!-- 版本选择 -->
          <div class="edition-section" v-if="product.editions?.length">
            <h3>选择版本</h3>
            <el-select v-model="selectedEdition" placeholder="请选择商品版本" class="edition-select" value-key="id">
              <el-option v-for="edition in product.editions" :key="edition.id"
                :label="`${edition.editionName} - ￥${edition.price}`" :value="edition">
                <span>{{ edition.editionName }}</span>
                <span class="option-storage">库存 {{ edition.storage }} 件</span>
              </el-option>
            </el-select>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="warning" :icon="ShoppingCart" :loading="loading" @click="handleAddToCart"
              :disabled="!selectedEdition && product.editions?.length" class="cart-button">
              加入购物车
            </el-button>

            <el-button type="success" :icon="Wallet" @click="buyNow"
              :disabled="!selectedEdition && product.editions?.length" class="buy-button">
              立即购买
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 评论区域 -->
    <el-card class="comment-card" shadow="never">
      <template #header>
        <div class="comment-header">
          <h2>商品评价</h2>
          <span class="comment-count">({{ product.comments?.length || 0 }})</span>
        </div>
      </template>

      <el-empty v-if="!product.comments?.length" description="暂无评论" />

      <div v-else class="comment-list">
        <div v-for="(comment, index) in paginatedComments" :key="index" class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{{ comment.userName }}</span>
            <span class="comment-date">{{ comment.createTime }}</span>
          </div>

          <p class="comment-content">{{ comment.content }}</p>

          <div class="comment-footer">
            <el-button :icon="Thumb" text :type="comment.likeActive ? 'primary' : ''" @click="toggleLike(index)">
              点赞 {{ comment.like || 0 }}
            </el-button>
          </div>

          <el-divider />
        </div>

        <el-pagination v-model:current-page="currentCommentPage" :page-size="commentsPerPage"
          :total="product.comments.length" layout="prev, pager, next" class="comment-pagination" />
      </div>

      <!-- 发表评论 -->
      <div class="add-comment">
        <h3>发表评论</h3>
        <el-input v-model="newComment" type="textarea" :rows="3" placeholder="请输入您的评论..." maxlength="200"
          show-word-limit />

        <div class="submit-button">
          <el-button type="primary" @click="submitComment" :disabled="!newComment.trim()">
            提交评论
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.product-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* 商品卡片样式 */
.product-card {
  margin-bottom: 24px;
  border: none;
}

.product-main {
  display: flex;
  gap: 30px;
}

.product-gallery {
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.thumbnail-list {
  flex: 0 0 80px;
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.thumbnail-item.active {
  border-color: var(--el-color-primary);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
}

.main-image {
  flex: 1;
  height: 500px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 24px;
  margin-bottom: 16px;
  color: #303133;
}

.meta-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-count {
  color: #909399;
  font-size: 14px;
}

.category-tag {
  margin-left: auto;
}

.price-section {
  margin: 0;
}

.price-label {
  font-size: 16px;
  color: #606266;
  margin-right: 8px;
}

.price-value {
  font-size: 24px;
  color: var(--el-color-primary);
  font-weight: bold;
}

.description-section,
.type-section,
.storage-section,
.edition-section {
  margin-bottom: 20px;
}

.edition-select {
  width: 200px;
  height: 60px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 30px;
}

.cart-button,
.buy-button {
  flex: 1;
  height: 48px;
  font-size: 16px;
}

/* 评论区域样式 */
.comment-card {
  border: none;
}

.comment-header {
  display: flex;
  align-items: center;
}
.comment-header h2 {
  margin: 0;
  font-size: 22px;
}

.comment-count {
  color: #909399;
  margin-left: 8px;
}

.comment-list {
  margin-top: 20px;
}

.comment-author {
  font-weight: bold;
  margin-right: 12px;
}

.comment-date {
  color: #909399;
  font-size: 14px;
}

.comment-content {
  margin: 12px 0;
  line-height: 1.6;
}

.comment-footer {
  display: flex;
  justify-content: flex-end;
}

.comment-pagination {
  justify-content: center;
  margin-top: 20px;
}

.add-comment {
  margin-top: 30px;
}

.submit-button {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .product-main {
    flex-direction: column;
  }

  .product-gallery {
    flex-direction: column;
  }

  .thumbnail-list {
    flex-direction: row;
    order: 2;
    margin-top: 16px;
  }

  .main-image {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .main-image {
    height: 300px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>