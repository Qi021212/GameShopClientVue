<script setup>
import { Search } from '@element-plus/icons-vue';
import { ref, computed, onMounted } from 'vue';
import { ElImage, ElTable, ElTableColumn, ElButton, ElCard, ElInput, ElPagination, ElMessage, carouselContextKey } from 'element-plus';
import { getProductsList } from '@/api/product.js';
import { useRouter, useRoute } from 'vue-router';
const products = ref([]);
// 分类映射
const categoryMap = {
  action: '动作',
  adventure: '冒险',
  casual: '休闲',
  role: '角色扮演',
  simulation: '模拟',
  sports: '体育',
};
// 获取商品数据并映射格式
const fetchProductList = async () => {
  try {
    const data = await getProductsList();
    if (data && Array.isArray(data)) {
      products.value = data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || '',
        type: item.type || '',
        // 如果 item.picture 存在，则拼接完整图片 URL，否则使用默认图片
        image: item.picture1 ? `http://localhost:8080/images/${item.picture1}` : '/src/assets/ProductsManage/img/loading.png',
        description: item.description || 0,
        price: item.price,
        storage: item.storage || 0,
      }));
    } else {
      ElMessage.warning('未获取到商品数据');
    }
  } catch (error) {
    ElMessage.error('获取商品数据失败');
  }
};


const currentCategory = computed(() => {
  const category = route.params.category
    ? decodeURIComponent(route.params.category).toLowerCase()
    : 'all'
  console.log('当前分类:', category)
  return category
})


// 搜索关键字
const searchQuery = ref('');
// 搜索产品
const searchProducts = () => {
  // 过滤逻辑
  console.log('Searching for:', searchQuery.value);
};
// 过滤后的产品
const filteredProducts = computed(() => {
  const result = products.value.filter(product => {
    // 深层检查数据完整性
    if (!product || typeof product !== 'object') {
      console.error('发现无效商品数据:', product)
      return false
    }
    // 分类过滤
    const categoryMatch = currentCategory.value === 'all' ||
      product.category === currentCategory.value;
    // 搜索过滤
    const searchMatch = product.name.toLowerCase().includes(
      searchQuery.value.toLowerCase()
    );
    return categoryMatch && searchMatch;
  });
  console.log('过滤结果', {
    rawData: products.value,
    filtered: result,
    currentCategory: currentCategory.value
  })
  return result
});




// 分页相关：当前页码和每页显示条数
const currentPage = ref(1);
const pageSize = ref(5); // 改为ref以便响应式变化

// 当前页显示的数据 (改名为paginatedProducts以保持一致性)
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredProducts.value.slice(start, start + pageSize.value);
});

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 创建路由实例
const router = useRouter();
const route = useRoute();


// 定义跳转到 ProductsDetail 页面的方法
const goToProductsDetail = (id) => {
  router.push(`/products/${id}`);
};


onMounted(fetchProductList); // 组件挂载时调用
</script>

<template>
  <div class="wrapper">
    <el-card class="main-card">
      <div class="card-body">
        <!-- 搜索栏 -->
        <div class="search-container">
          <el-input v-model="searchQuery" placeholder="搜索游戏..." class="search-input" @keyup.enter="searchProducts"
            clearable>
            <template #prefix>
              <el-icon @click="searchProducts">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <!-- 产品表格 -->
        <el-table :data="paginatedProducts" style="width: 100%">
          <el-table-column label="商品信息" width="400">
            <template #default="{ row }">
              <div class="product-info">
                <el-image :src="row.image" :alt="row.name" class="product-image" fit="cover"
                  @click="goToProductsDetail(row.id)" />
                <div class="product-details">
                  <div class="product-name">{{ row.name }}</div>
                  <div class="product-type">{{ row.type }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="类别" width="120">
            <template #default="{ row }">
              {{ categoryMap[row.category] || row.category }}
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格" width="120">
            <template #default="{ row }">
              ￥{{ row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="storage" label="库存" width="120" />

          <el-table-column>
            <template #default="{ row }">
              <el-button type="success" @click="goToProductsDetail(row.id)">添加到购物车</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :small="false"
            :background="true" layout="total, prev, pager, next, jumper" :total="filteredProducts.length"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.main-card {
  margin: 20px;
}

.card-body {
  padding: 20px;
}

.search-container {
  margin-bottom: 20px;
  display: flex;
}

.search-input {
  width: 300px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 60px;
  margin-right: 15px;
  border-radius: 4px;
}

.product-details {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.product-type {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
</style>