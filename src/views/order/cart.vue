<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter() // 确保已导入useRouter
import { ElMessage, ElMessageBox } from 'element-plus'

// 购物车数据
const cartItems = ref([
  {
    id: 1,
    name: '赛博朋克2077',
    version: '标准版',
    price: 298.00,
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg'
  },
  {
    id: 2,
    name: '艾尔登法环',
    version: '豪华版',
    price: 398.00,
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg'
  },
  {
    id: 3,
    name: '只狼：影逝二度',
    version: '年度版',
    price: 268.00,
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg'
  },

])

// 选中项
const selectedItems = ref([])
const selectAll = ref(false)

// 计算总价
const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.price, 0)
})


// 选择变化
const handleSelectionChange = (selection) => {
  selectedItems.value = selection
  selectAll.value = selection.length === cartItems.value.length
}

// 单个删除
const handleRemove = (id) => {
  ElMessageBox.confirm('确定要移除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartItems.value = cartItems.value.filter(item => item.id !== id)
    // 从选中项中也移除
    selectedItems.value = selectedItems.value.filter(item => item.id !== id)
    ElMessage.success('已移除商品')
  })
}

// 批量删除
const handleBatchRemove = () => {
  ElMessageBox.confirm(`确定要移除选中的 ${selectedItems.value.length} 件商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const selectedIds = new Set(selectedItems.value.map(item => item.id))
    cartItems.value = cartItems.value.filter(item => !selectedIds.has(item.id))
    selectedItems.value = []
    selectAll.value = false
    ElMessage.success('已移除选中商品')
  })
}

// 提交订单
const handleSubmitOrder = () => {

  ElMessageBox.confirm(
    `确认购买 ${selectedItems.value.length} 件商品，总价 ¥${totalPrice.value.toFixed(2)}？`,
    '确认订单',
    {
      confirmButtonText: '确认支付',
      cancelButtonText: '再想想',
      type: 'success'
    }
  ).then(() => {
    // 1. 创建订单数据
    const orderData = {
      items: [...selectedItems.value], // 复制选中的商品
      total: totalPrice.value,
      selectedIds: selectedItems.value.map(item => item.id)
    }
    // 2. 这里应该是实际调用提交订单API的地方
    // 例如：await submitOrderAPI(orderData)
    // 3. 从购物车中移除已购买的商品
    const selectedIds = new Set(selectedItems.value.map(item => item.id))
    cartItems.value = cartItems.value.filter(item => !selectedIds.has(item.id))
    // 4. 清空选中状态
    selectedItems.value = []
    selectAll.value = false
    // 5. 显示成功消息
    ElMessage.success('订单提交成功！')
    // 6. 跳转到结算页面
    router.push('/checkout');
  }).catch(() => {
    // 用户点击"再想想"或关闭对话框时执行
    console.log('用户取消了订单提交')
  })
}
</script>


<template>
  <div class="cart-container">
    <div class="cart-header">
      <h2>我的购物车</h2>
      <!-- 购物车操作 -->
      <div class="cart-actions">
        <el-button type="danger" :disabled="selectedItems.length === 0" @click="handleBatchRemove">批量删除</el-button>
      </div>
    </div>
    <!-- 购物车列表 -->
    <div class="cart-list">
      <el-table :data="cartItems" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <!-- 商品信息列 -->
        <el-table-column label="商品信息" width="400">
          <template #default="{ row }">
            <div class="game-info">
              <el-image :src="row.image" fit="cover" class="game-image" />
              <div class="game-details">
                <h4 class="game-name">{{ row.name }}</h4>
                <p class="game-version">{{ row.version }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 商品单价列 -->
        <el-table-column prop="price" label="单价" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleRemove(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 结算区 -->
    <div class="cart-footer">
      <div class="total-info">
        <span>已选 {{ selectedItems.length }} 件商品</span>
        <span class="total-price">合计: ¥{{ totalPrice.toFixed(2) }}</span>
      </div>
      <el-button type="primary" size="large" :disabled="selectedItems.length === 0"
        @click="handleSubmitOrder">去结算</el-button>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.cart-header h2 {
  font-size: 24px;
  color: #ffffff;
  margin: 0;
}

.cart-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.cart-list {
  margin-bottom: 30px;
}

.game-info {
  display: flex;
  align-items: center;
}

.game-image {
  width: 80px;
  height: 45px;
  border-radius: 4px;
  margin-right: 15px;
}

.game-details {
  flex: 1;
}

.game-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
}

.game-version {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.price {
  font-weight: bold;
  color: #ff6700;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
}

.total-info {
  display: flex;
  flex-direction: column;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff6700;
  margin-top: 5px;
}
</style>