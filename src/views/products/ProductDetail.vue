<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { getProductDetail,addProductComment } from '@/api/product.js';
import { ElMessage } from 'element-plus';
import { addToCart } from '@/api/cart.js'

const route = useRoute();
const router = useRouter({
});




const product = ref([]);
const selectedEdition = ref(null);

// 新增用户ID获取（根据实际存储方式调整）
const userId = ref(null)
onMounted(() => {
  // 示例：从 localStorage 获取用户ID
  userId.value = 14 || null
})


// 评论分页控制
const commentsPerPage = 3;
const currentPage = ref(1);

// 分页评论
const paginatedComments = computed(() => {
  const start = (currentPage.value - 1) * commentsPerPage;
  const end = currentPage.value * commentsPerPage;
  return product.value.comments.slice(start, end);
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(product.value.comments.length / commentsPerPage);
});

// 切换页面
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
// 评论功能逻辑：
const newComment = ref('')
const submitComment = async () => {
  if (!newComment.value?.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  try {
    await addProductComment(
      route.params.id,  // 商品ID
      newComment.value.trim(), // 评论内容
      userId.value      // 用户ID
    )
    await fetchProductDetail(route.params.id)
    ElMessage.success('评论发表成功')
    newComment.value = ''
  }catch (error) {
    console.error('评论提交失败:', error)
    ElMessage.error('评论提交失败')
  }
}
//商品图片展示功能
// activeImageIndex 表示当前大图展示的图片下标（0~4，对应 picture1~picture5）
const activeImageIndex = ref(0);
let carouselTimer = null;

// 计算实际存在的图片 key 数组（最多五张）
const actualPictureKeys = computed(() => {
  if (!product.value) return [];
  const keys = [];
  for (let i = 1; i <= 5; i++) {
    const key = `picture${i}`;
    if (product.value[key] && product.value[key].trim() !== "") {
      keys.push(key);
    }
  }
  return keys;
});

// 开始轮播：每隔 3 秒自动切换，基于实际图片数量轮播
const startCarousel = () => {
  stopCarousel();
  carouselTimer = setInterval(() => {
    const count = actualPictureKeys.value.length;
    if (count > 0) {
      activeImageIndex.value = (activeImageIndex.value + 1) % count;
    }
  }, 3000);
};
// 停止轮播
const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
};
// 鼠标悬停时：暂停轮播并显示对应图片
const handleMouseOver = (index) => {
  stopCarousel();
  activeImageIndex.value = index;
};
// 鼠标离开后恢复轮播
const handleMouseLeave = () => {
  startCarousel();
};

const fetchProductDetail = async () => {
  const id = route.params.id; // 获取路由参数
  if (!id) {
    ElMessage.error('商品 id 缺失');
    return;
  }
  try {
    console.log('id：', id);
    const data = await getProductDetail(id);
    console.log('获取到的商品详情数据：', data);
    // product.value = data;
    // 同时合并评论和子种类数据（editions），确保数据存在
    product.value = { 
      ...data, 
      comments: data.comments || [],
      editions: data.editions || [] 
    };
    // 启动轮播（如果存在图片则从第一张开始）
    activeImageIndex.value = 0;
    startCarousel();
    
  } catch (error) {
    ElMessage.error('获取商品详情失败');
  }
};

// 添加购物车方法
const handleAddToCart = async () => {
  try {
    // if (!userId.value) {
    //   ElMessage.warning('请先登录')
    //   return router.push('/login')
    // }

    if (!selectedEdition.value) {
      return ElMessage.warning('请选择商品版本')
    }

    const params = {
      userId: 14,
      // userId.value,
      itemId: product.value.id,
      editionId: selectedEdition.value.id,
      price: selectedEdition.value.price
    }

    const res = await addToCart(params)
    if (res.data === 'success') {
      ElMessage.success('已加入购物车')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '添加失败')
  }
}


// 处理版本选择
const selectEdition = (edition) => {
  selectedEdition.value = edition;
};
// 修改：处理下拉框选择
const handleSelectChange = (val) => {
  selectedEdition.value = val
}


// 为评论点赞功能添加 toggleLike 方法
const toggleLike = (index) => {
  const comment = product.value.comments[index];
  if (comment) {
    // 如后端未返回 likeActive 和 like 字段，则初始化
    if (comment.likeActive === undefined) {
      comment.likeActive = false;
    }
    if (comment.like === undefined) {
      comment.like = 0;
    }
    // 切换点赞状态，并更新点赞数
    comment.likeActive = !comment.likeActive;
    comment.like = comment.likeActive ? comment.like + 1 : comment.like - 1;
  }
};

onMounted(fetchProductDetail);
onMounted(()=>{
  const originalBodyStyle = document.body.style.cssText;
  document.body.style.display = 'block'; 
  onBeforeUnmount(()=>{ document.body.style.cssText = originalBodyStyle;})
})
onBeforeUnmount(() => {
  stopCarousel();
});
</script>

<template>
  <div class="wrapper">
    <div class="main">
      <div class="card" v-if="product" style="">
        <div style="padding: 20px 5px 0px 20px;">
          <h2 style="color: #303133;">商品详情</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-xl-7 col-xxl-6">
              <div>
                <div class="row">
                  <!-- 缩略图区域 -->
                  <div class="col-4 col-md-3 col-xxl-2">
                    <div class="nav flex-column nav-outline" role="tablist" aria-orientation="vertical">
                      <!-- 遍历实际存在的图片 -->
                      <a
                        v-for="(picKey, index) in actualPictureKeys"
                        :key="picKey"
                        class="nav-link p-1"
                        :class="{ active: activeImageIndex === index }"
                        @mouseover="handleMouseOver(index)"
                        @mouseleave="handleMouseLeave"
                      >
                        <img
                          :src="`http://localhost:8080/images/${product[picKey]}`"
                          :alt="`商品图片${index + 1}`"
                          class="img-fluid mx-auto d-block rounded mh-75px"
                        />
                      </a>
                    </div>
                  </div>
                  <!-- 主展示区域 -->
                  <div class="col-8 col-md-1 col-xxl-9">
                    <div class="tab-content p-3">
                      <div>
                        <!-- 仅显示实际存在的图片 -->
                        <img
                          v-if="actualPictureKeys.length > 0"
                          :src="`http://localhost:8080/images/${product[actualPictureKeys[activeImageIndex]]}`"
                          alt="商品图片"
                          class="img-fluid"
                        />
                        <img
                          v-else
                          src="/src/assets/ProductsManage/img/loading.png"
                          alt="加载中"
                          class="img-fluid"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      <h5>商品版本:</h5>
                      <div id="classificationList" class="col-8 col-md-1 col-xxl-10">
                        <!-- 当存在子种类（editions）时，循环展示每个子种类 -->
                        <template v-if="product.editions && product.editions.length > 0">
                          <div v-for="edition in product.editions" :key="edition.id" class="input-group mb-3 classification-item" :class="{ 'selected-edition': selectedEdition?.id === edition.id }" @click="selectEdition(edition)">
                            <span class="input-group-text form-control-lg price">￥{{ edition.price }}</span>
                            <span class="form-control form-control-lg name">{{ edition.editionName }}</span>
                            <span class="input-group-text form-control-lg storage me-2">{{ edition.storage }}件</span>
                          </div>
                        </template>
                        <!-- 否则展示单个大商品信息 -->
                        <template v-else>
                          <div class="input-group mb-3 classification-item">
                            <span class="input-group-text form-control-lg price">￥{{ product.price }}</span>
                            <span class="form-control form-control-lg name">{{ product.name }}</span>
                            <span class="input-group-text form-control-lg storage me-2">{{ product.storage }}件</span>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-5 col-xxl-5">
              <h4 class="mt-1">{{ product.name }}</h4>
              <span class="badge badge-subtle-primary">{{ product.category }}</span>
              <p class="mb-3">
                <i class="fa-solid text-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    data-lucide="star" class="lucide lucide-star align-middle me-2">
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
                    </polygon>
                  </svg>
                </i> 4.6 <span class="text-muted">out of 40 Reviews</span>
              </p>

              <h4 class="mb-3">价格: ￥{{ product.price }}起</h4>

              <div class="row mb-3">
                <div class="col-md-12">
                  <p class="text-muted mb-4">
                    <i class="align-middle">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        data-lucide="map" class="lucide lucide-map align-middle me-2">
                        <path
                          d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z">
                        </path>
                        <path d="M15 5.764v15"></path>
                        <path d="M9 3.236v15"></path>
                      </svg>
                    </i>
                    <span class="align-middle">简介：{{ product.description }}</span>
                  </p>
                  <p class="text-muted">
                    <i class="align-middle">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        data-lucide="tag" class="lucide lucide-tag align-middle me-2">
                        <path
                          d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z">
                        </path>
                        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle>
                      </svg>
                    </i>
                    <span class="align-middle">分类:{{ product.type }}</span>
                  </p>
                  <p class="text-muted">
                    <i class="align-middle">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        data-lucide="database" class="lucide lucide-database align-middle me-2">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                        <path d="M3 12A9 3 0 0 0 21 12"></path>
                      </svg>
                    </i>
                    <span class="align-middle">库存:{{ product.storage }}件</span>
                  </p>
                       <!-- 版本选择下拉框 -->
                    <div class="row mb-3" v-if="product.editions?.length > 0">
                      <div class="col-md-12">
                        <el-select 
                          v-model="selectedEdition"
                          placeholder="请选择商品版本"
                          class="w-100 mb-3" value-key="id" 
                          @change="handleSelectChange"
                        >
                          <el-option
                            v-for="edition in product.editions"
                            :key="edition.id"
                            :label="edition.editionName"
                            :value="edition"
                          >
                            <span>{{ edition.editionName }}</span>
                            <span class="float-end text-muted">库存 {{ edition.storage }} 件</span>
                          </el-option>
                        </el-select>
                      </div>
                    </div>
                    <!-- 修改操作按钮部分 -->
                  <div class="row mb-3">
                    <div class="col-md-12">
                      <div class="d-flex gap-2">
                        <!-- 加入购物车按钮 (黄色) -->
                        <el-button 
                          type="warning" 
                          size="large"
                          class="flex-grow-1"
                          :loading="loading"
                          @click="handleAddToCart"
                          :disabled="!selectedEdition"
                        >
                         <template v-if="!loading">
                          <el-icon><ShoppingCart /></el-icon>
                          加入购物车
                          </template>
                          <template v-else>添加中...</template>
                        </el-button>

                        <!-- 立即购买按钮 (绿色) -->
                        <el-button 
                          type="success" 
                          size="large"
                          class="flex-grow-1"
                          @click="buyNow"
                          :disabled="!selectedEdition"
                        >
                          <el-icon><Wallet /></el-icon>
                          立即购买
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>加载中...</p>
      </div>

      <div class="card" v-if="product.comments">
        <div class="card-header">
          <h5 class="card-title mb-0">
            Comments (<span id="commentNum">{{ product.comments.length }}</span>)
          </h5>
        </div>
        <div class="card-body">
          <!-- 当评论列表为空时，显示暂无评论 -->
          <div v-if="product.comments.length === 0">
            <p>暂无评论</p>
          </div>
          <!-- 遍历评论数组 -->
          <div v-for="(comment, index) in paginatedComments" :key="index" class="d-flex align-items-start">
            <!--<img :src="comment.avatar || '@/assets/ProductsManage/img/头像.jpg'" width="56" height="56" class="rounded-circle me-3" alt="头像">-->
            <div class="flex-grow-1">
              <div style="text-align: left;">
              <small class="float-end">{{ comment.createTime }}</small>
              <p class="mb-2"><strong>{{ comment.userName }}</strong></p>
              <p>{{ comment.content }}</p>
              </div>
              <div style="text-align: right;">
                <ul style="display: flex; list-style-type: none; padding: 0; margin: 0 0 0 920px;">
                  <!-- 点赞按钮 -->
                  <li style="margin-right: 10px;">
                    <a class="nav-item dropdown nav-icon dropdown-toggle like-btn" @click="toggleLike(index)"
                      :class="{ active: comment.likeActive }">
                      <div class="position-relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                          data-lucide="thumbs-up" class="lucide lucide-message-circle align-middle text-body">
                          <path d="M7 10v12"></path>
                          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                        </svg>
                        <span class="indicator">{{ comment.like }}</span>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            <hr/>
            </div>
          </div>
          <!-- 分页按钮 -->
              <div class="d-flex justify-content-center mt-4">
                <button
                  class="btn btn-primary"
                  :disabled="currentPage === 1"
                  @click="changePage(currentPage - 1)"
                >上一页</button>
                <span class="mx-2">页 {{ currentPage }} / {{ totalPages }}</span>
                <button
                  class="btn btn-primary"
                  :disabled="currentPage === totalPages"
                  @click="changePage(currentPage + 1)"
                >下一页</button>
              </div>
        <div class="card-header">
          <h5 class="card-title mb-0">发表评论</h5>
        </div>
        <div class="card-body">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="请输入您的评论..."
            maxlength="200"
            show-word-limit
            class="mb-3"
          ></el-input>
          <div class="d-flex justify-content-end">
            <el-button 
              type="primary" 
              @click="submitComment"
              :disabled="!newComment.trim()"
            >
              提交评论
            </el-button>
          </div>
        </div>
        </div>
      </div>  
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/ProductsManage/app.css";
@import '../../assets/ProductsManage/style.css';
.wrapper, .main {
  width: 100%; /* 让宽度占满可用空间 */
  max-width: 1200px; /* 设置最大宽度 */
  margin: 0 auto; /* 居中对齐 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* 添加选中样式 */
.classification-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.classification-item:hover {
  background-color: #f5f7fa;
}

.selected-edition {
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary);
}

/* 按钮间距调整 */
.d-grid.gap-2 {
  gap: 1rem !important;
}
.el-button--warning {
  background-color: #e6a23c !important;
  border-color: #e6a23c !important;
  color: white !important;
}

.el-button--warning:hover {
  background-color: #cf9236 !important;
  border-color: #cf9236 !important;
}

.el-button--warning:disabled {
  background-color: #e6a23c80 !important;
  border-color: #e6a23c80 !important;
}

.el-button--success {
  background-color: #67c23a !important;
  border-color: #67c23a !important;
  color: white !important;
}

.el-button--success:hover {
  background-color: #5daf34 !important;
  border-color: #5daf34 !important;
}

.d-flex.gap-2 {
  gap: 0.5rem;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>