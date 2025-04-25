<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter() // 确保已导入useRouter
import { ElMessage, ElMessageBox } from 'element-plus'

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

// 购物车数据
const cartItems = ref([]);
import { getCartList } from '@/api/cart.js'
// 获取购物车列表
const fetchCartList = async () => {
  try {
    const response = await getCartList(localUserInfo.value.id); 
    console.log(response);
    if (response && Array.isArray(response)) { // 检查是否为数组
      cartItems.value = response.map(item => ({
        ...item,
        picture1: item.picture1 ? `/images/${item.picture1}` : '/src/assets/loading.png',
      }));
    } else {
      ElMessage.warning('未获取到购物车数据');
    }
  } catch (error) {
    ElMessage.error('获取购物车数据失败');
  }
};



// 单个删除
import { deleteCartItem } from '@/api/cart.js';
const handleRemove = async (id) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm('确定要移除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // 调用API删除商品
    const response = await deleteCartItem(id)
    // 根据后端返回结果处理
    if (response.code === 200) { // 假设成功返回code为200
      // 从本地购物车列表中移除
      cartItems.value = cartItems.value.filter(item => item.id !== id)
      // 从选中项中也移除
      selectedItems.value = selectedItems.value.filter(item => item.id !== id)
      ElMessage.success('已移除商品')
    } else {
      ElMessage.error(response.message || '移除商品失败')
    }
  } catch (error) {
    // 用户点击取消或API调用失败
    if (error !== 'cancel') { // 不是用户主动取消的情况
      console.error('删除商品失败:', error)
      ElMessage.error(error.message || '移除商品失败')
    }
  }
}


// 去结算
// 选中项
const selectedItems = ref([])
// 计算总价
const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.price, 0)
})
// 选择变化
const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}
import { updateCartItemStatus } from '@/api/cart.js'
// 结算
const handleSubmitOrder = async () => {
  try {
    // 确认对话框
    await ElMessageBox.confirm(
      `确认购买 ${selectedItems.value.length} 件商品，总价 ¥${totalPrice.value.toFixed(2)}？`,
      '确认订单',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '再想想',
        type: 'success'
      }
    )
    // 调用提交订单API
    const ids = selectedItems.value.map(item => item.id)
    const response = await updateCartItemStatus(ids);
    if (response) {
      ElMessage.success('订单生成成功！')
      // 刷新购物车列表
      await fetchCartList()
      // 清空选中状态
      selectedItems.value = []
      // 跳转到订单详情页
      router.push('/checkout')
    } else {
      ElMessage.error(response.message || '订单生成失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '订单生成失败')
    }
  }
}

onMounted(() => {
  fetchCartList();
  getUserInfo();
})
</script>


<template>
  <div class="cart-container">
    <div class="cart-header">
      <h2>我的购物车</h2>
    </div>
    <!-- 购物车列表 -->
    <div class="cart-list">
      <el-table :data="cartItems" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <!-- 商品信息列 -->
        <el-table-column label="商品信息" width="400">
          <template #default="{ row }">
            <div class="game-info">
              <el-image :src="row.picture1" fit="cover" class="game-image" />
              <div class="game-details">
                <h4 class="game-name">{{ row.itemName }}</h4>
                <p class="game-version">{{ row.editionName }}</p>
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