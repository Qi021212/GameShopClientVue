
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { getProductsList } from '@/api/product.js';
import { ElMessage } from 'element-plus';
import { ref, onMounted, onBeforeUnmount, computed,watch } from 'vue';

const router = useRouter()
const route = useRoute()
const allProducts = ref([])
const loading = ref(false)
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


// 监听路由变化更新激活状态
watch(() => route.params.category, (newVal) => {
  activeCategory.value = newVal || '全部'
}, { immediate: true })

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
</script>

<template>
   <div class="category-nav">
    <el-skeleton v-if="loading" :rows="0" animated />
    
    <el-menu 
      v-else
      mode="horizontal"
      :default-active="activeCategory"
      active-text-color="#409EFF"
    >
      <el-menu-item 
        v-for="category in categories"
        :key="category"
        :index="category"
        @click="handleSelect(category)"
      >
        {{ category }}
        <el-icon v-if="category === activeCategory" class="active-icon">
          <Select />
        </el-icon>
      </el-menu-item>
    </el-menu>
  </div>
</template>


<style scoped>
.category-nav {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.el-menu {
  padding: 0 20px;
  border: none;
}

.el-menu-item {
  height: 60px;
  line-height: 60px;
  font-size: 16px;
  margin: 0 15px;
  transition: all 0.3s;
  position: relative;

  &:hover {
    background: #ecf5ff !important;
    transform: translateY(-2px);
  }

  .active-icon {
    position: absolute;
    right: 8px;
    bottom: 8px;
    font-size: 12px;
    color: #409EFF;
  }
}
</style>