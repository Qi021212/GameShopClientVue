<script setup>
import { ElMessage ,ElMessageBox} from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import { getProductsList, deleteProduct, deleteBatchProducts } from '@/api/product.js';
import { useRouter, useRoute} from 'vue-router';
const products = ref([]);

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
        price: `￥${item.price?.toFixed(2) || '0.00'}`,
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
  console.log('收到的路由参数',{category:route.params.category })
  const category = route.params.category 
    ? decodeURIComponent(route.params.category).toLowerCase() 
    : 'all'
  return category
})
// 删除单个商品
const deleteProductById = async (id) => {
  // 弹出确认框，询问是否删除
  ElMessageBox.confirm('是否删除该商品?', '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(async () => {
    // 用户点击确认后，执行删除操作
    try {
      const result = await deleteProduct(id); // 调用删除商品的 API
      ElMessage.success('商品删除成功');
      fetchProductList(); // 删除成功后刷新商品列表
    } catch (error) {
      ElMessage.error('删除商品失败');
    }
  })
  .catch(() => {
    // 用户点击取消，不做任何操作
    ElMessage.info('删除操作已取消');
  });
};


// 搜索关键字
const searchQuery = ref('');
// 搜索产品
const searchProducts = () => {
  // 过滤逻辑
  console.log('Searching for:', searchQuery.value);
};
// 过滤后的产品
const filteredProducts = computed(() => {
  const result = products.value.filter(product =>{
     // 深层检查数据完整性
    if (!product || typeof product !== 'object') {
      console.error('发现无效商品数据:', product)
      return false
    }
    // 分类过滤
    const categoryMatch = currentCategory.value === 'all' || 
                         product.category === currentCategory.value;
       // 搜索过滤
    const searchMatch =product.name.toLowerCase().includes(
      searchQuery.value.toLowerCase()
    );
      return categoryMatch && searchMatch;
  });
  console.log('过滤结果',{
    rawData: products.value,
    filtered: result,
    currentCategory: currentCategory.value
  })
  return result
});

// 选中的产品（用于全选）
const selectedProducts = ref([]);
// 全选/取消全选
const selectAllProducts = () => {
  if (selectedProducts.value.length === filteredProducts.value.length) {
    selectedProducts.value = [];
  } else {
    selectedProducts.value = filteredProducts.value.map(product => product.id);
  }
};

// 选中的产品
const selectedProduct = ref(null);
// 控制侧边栏显示的状态
const isSidebarVisible = ref(false);
// 打开侧边栏并传入选中的商品
const openSidebar = (product) => {
  selectedProduct.value = product;
  isSidebarVisible.value = true;
};
// 关闭侧边栏
const closeSidebar = () => {
  isSidebarVisible.value = false;
  selectedProduct.value = null;
};


// 分页相关：当前页码和每页显示条数
const currentPage = ref(1);
const pageSize = 4;
// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / pageSize);
});
// 当前页显示的数据
const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredProducts.value.slice(start, start + pageSize);
});

// 创建路由实例
const router = useRouter();
const route = useRoute();


// 定义跳转到 ProductsDetail 页面的方法
const goToProductsDetail = (id) => {
  router.push(`/products/${id}`);
};


onMounted(fetchProductList
  
); // 组件挂载时调用
</script>

<template>
  <div class="wrapper">
    <div class="main">
      <div class="">
        <!-- 页面主内容 -->
        <div class="container-fluid p-0">
            <div class="card">
              <div style="padding: 20px 5px 0px 20px;">
                <h2 style="color: #303133;">商品列表</h2>
              </div>
              <div class="card-body">
                <!-- 搜索和按钮 -->
                <div class="row mb-3">
                  <div class="col-md-6 col-xl-4 mb-2 mb-md-0">
                    <div class="input-group input-group-search">
                      <input type="text" class="form-control" v-model="searchQuery" placeholder="搜索商品..." aria-label="Search"
                        aria-describedby="button-addon2">
                      <button class="btn" type="button" @click="searchProducts">搜索</button>                    
                    </div>
                  </div>
                </div>
                <div id="datatables-products_wrapper" class="dt-container dt-bootstrap5 dt-empty-footer">
                  <div class="row mt-2 justify-content-md-center">
                    <div class="col-12">
                      <!-- 产品表格 -->
                      <table id="datatables-products" class="table w-100">
                        <thead>
                          <tr>
                            <th class="align-middle">
                              <div class="form-check fs-4">
                                <input class="form-check-input" type="checkbox" id="datatables-products-check-all"
                                  @click="selectAllProducts">
                                <label class="form-check-label" for="datatables-products-check-all"></label>
                              </div>
                            </th>
                            <th class="align-middle">商品名称</th>
                            <th class="align-middle">价格</th>
                            <th class="align-middle">库存</th>
                            <th class="align-middle">类别</th>
                            <th class="align-middle">评分评论</th>
                            <th class="align-middle text-end">操作
                             
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(product, index) in pagedProducts" :key="index">
                            <td>
                              <div class="form-check fs-4">
                                <input class="form-check-input" type="checkbox" v-model="selectedProducts"
                                  :value="product.id">
                                <label class="form-check-label"></label>
                              </div>
                            </td>
                            <td class="d-flex align-items-center">
                              <!--商品图片-->
                              <div
                                class="p-2 rounded bg-body-tertiary d-flex justify-content-center align-items-center me-2 w-150px h-100px">
                                <img :src="product.image" class="mw-100 mh-100" :alt="product.name">
                              </div>
                              <p class="mb-0">
                                <strong>{{ product.name }}</strong><br />
                                <span class="text-muted">{{ product.type }}</span>
                              </p>
                            </td>
                            <td>{{ product.price }}</td>
                            <td>{{ product.storage }}</td>
                            <td>{{ product.category }}</td>
                            <td>
                              <i class="fa-solid text-warning">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                  stroke-linejoin="round" data-lucide="star"
                                  class="lucide lucide-star align-middle me-2">
                                  <polygon
                                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">
                                  </polygon>
                                </svg>
                              </i>4.6
                              <span class="text-muted">out of 2 Reviews</span>
                            </td>
                            <td class="text-end">
                              <!-- 详情按钮，点击打开侧边栏
                                    <button class="btn btn-light" @click="openSidebar(product)">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="info" class="lucide lucide-info align-middle"></svg>
                                    </button> -->
                              <!--查询商品详情按钮-->
                              <button type="button" class="btn btn-light" @click="goToProductsDetail(product.id)">
                                <!-- <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                  stroke-linejoin="round" data-lucide="trash-2"
                                  class="lucide lucide-trash-2 align-middle"></svg> -->
                                详情
                              </button>
                              
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- 分页导航栏 -->
                  <div class="row mt-2 justify-content-between">
                    <div class="col-md-auto me-auto">
                      <div class="dt-info" aria-live="polite" id="datatables-products_info" role="status">
                        显示第 {{ (currentPage - 1) * pageSize + 1 }} 至
                        {{ Math.min(currentPage * pageSize, filteredProducts.length) }} 条，共
                        {{ filteredProducts.length }} 条记录
                      </div>
                    </div>
                    <div class="col-md-auto ms-auto">
                      <ul class="pagination">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                          <a class="page-link" href="#" @click.prevent="currentPage = 1">«</a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                          <a class="page-link" href="#" @click.prevent="currentPage--">‹</a>
                        </li>
                        <li v-for="page in totalPages" :key="page" class="page-item"
                          :class="{ active: currentPage === page }">
                          <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                          <a class="page-link" href="#" @click.prevent="currentPage++">›</a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                          <a class="page-link" href="#" @click.prevent="currentPage = totalPages">»</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>

        </div>
      </div>

    </div>


    <!-- 侧边栏组件 -->
    <AddProductBar v-if="isSidebarVisible" :product="selectedProduct" @close-sidebar="closeSidebar"
      :class="['addProductBarClass', { 'open': isSidebarVisible }]" />

    <!-- 蒙层 -->
    <div v-if="isSidebarVisible" class="overlay" @click="closeSidebar"></div>
  </div>

</template>



<style scoped>
@import "../../assets/ProductsManage/app.css";
@import '../../assets/ProductsManage/style.css';

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-card__header) {
  border-bottom: none !important;
  /* 去掉下划线 */
  padding-bottom: 0;
  /* 去掉多余的 padding */
}

h2 {
  margin: 0;
}
</style>