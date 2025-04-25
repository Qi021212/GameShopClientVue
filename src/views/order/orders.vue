<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

// 订单数据
const orderData = ref([])

// 获取订单列表
import { getOrderList } from '@/api/order.js'
const fetchOrderList = async () => {
    try {
        const response = await getOrderList(localUserInfo.value.id); // 假设13是用户ID
        console.log(response);
        if (response && Array.isArray(response)) { // 检查是否为数组
            orderData.value = response.map(item => ({
                ...item,
                shippingInfo: {
                    name: item.name,
                    phone: item.phone,
                    email: item.email,
                },
                items: item.items.map(i => ({
                    ...i,
                    image: i.picture1 ? `/images/${i.picture1}` : '/src/assets/loading.png',
                })),
            }));
        } else {
            ElMessage.warning('未获取到订单数据');
        }
    } catch (error) {
        ElMessage.error('获取订单数据失败');
    }
};


// 收货信息弹窗相关
const shippingDialogVisible = ref(false)
const currentShippingInfo = ref(null)
const currentOrderId = ref('')

// 显示收货信息弹窗
const showShippingInfo = (order) => {
    currentShippingInfo.value = order.shippingInfo
    currentOrderId.value = order.orderId
    shippingDialogVisible.value = true
}

// 格式化时间
const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString()
}

// 获取支付方式名称
const getPaymentMethodName = (method) => {
    const methods = {
        1: '支付宝',
        2: '微信支付',
    }
    return methods[method] || method
}

// 获取支付方式标签类型
const getPaymentTagType = (method) => {
    const types = {
        alipay: 'primary',
        wechat: 'success',
    }
    return types[method] || ''
}


// 筛选状态
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = 5

// 筛选订单
const filteredOrders = computed(() => {
    let result = orderData.value
    if (filterStatus.value) {
        if (filterStatus.value === 'unpaid') {
            result = result.filter(order => order.status === 1)
        } else if (filterStatus.value === 'paid') {
            result = result.filter(order => order.status === 2)
        }
    }
    return result
})

// 分页后的订单（筛选 + 分页）
const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return filteredOrders.value.slice(start, end);
});
// 切换筛选条件时重置页码
watch(filterStatus, () => {
    currentPage.value = 1;
});


// 修改支付状态
import { updateOrderStatus } from '@/api/order.js';
const handlePay = async (orderId) => {
    console.log('支付订单:', orderId);
  try {
    await ElMessageBox.confirm('确认支付该订单吗？', '支付确认', {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 调用后端接口更新状态
    const response = await updateOrderStatus(orderId); 

    if (response) {
      // 更新本地数据
      const order = orderData.value.find(o => o.orderId === orderId);
      if (order) {
        order.status = 2;
      }     
      ElMessage.success('支付成功！')
      fetchOrderList();
    } else {
      ElMessage.error(response.message || '支付失败');
    }
  } catch (error) {
    // 用户点击取消或请求失败
    if (error !== 'cancel') {
      ElMessage.error('支付请求失败，请重试');
    }
  }
};

onMounted(() => {
    fetchOrderList();
    getUserInfo();
})
</script>


<template>
    <div class="order-container">
        <div class="order-header">
            <h2>我的订单</h2>
            <div class="order-filter">
                <el-select v-model="filterStatus" placeholder="订单状态" clearable>
                    <el-option label="全部" value=""></el-option>
                    <el-option label="待支付" value="unpaid"></el-option>
                    <el-option label="已支付" value="paid"></el-option>
                </el-select>
            </div>
        </div>
        <div class="order-card">
            <!-- 订单列表 -->
            <div class="order-list">
                <el-table :data="paginatedOrders" style="width: 100%" row-key="orderId">
                    <el-table-column prop="orderId" label="订单编号" width="80">
                        <template #default="{ row }">
                            <span class="order-id">{{ row.orderId }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="订单物品" width="300">
                        <template #default="{ row }">
                            <div class="order-items">
                                <div v-for="item in row.items" :key="item.id" class="order-item">
                                    <el-image :src="item.image" class="item-image"></el-image>
                                    <div class="item-info">
                                        <div class="item-name">{{ item.itemName }}</div>
                                        <div class="item-details">
                                            <span class="item-version">{{ item.editionName }}</span>
                                            <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="total" label="合计" width="120">
                        <template #default="{ row }">
                            <span class="total-price">¥{{ row.total.toFixed(2) }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="orderTime" label="下单时间" width="180">
                        <template #default="{ row }">
                            <span class="order-time">{{ formatTime(row.datetime) }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="收货信息" width="120">
                        <template #default="{ row }">
                            <el-button type="text" @click="showShippingInfo(row)">查看收货信息</el-button>
                        </template>
                    </el-table-column>

                    <el-table-column prop="paymentMethod" label="支付方式" width="100">
                        <template #default="{ row }">
                            <el-tag :type="getPaymentTagType(row.paytype)">{{ getPaymentMethodName(row.paytype)
                                }}</el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column prop="isPaid" label="支付状态" width="100">
                        <template #default="{ row }">
                            <el-tag :type="row.status === 2 ? 'success' : 'danger'">{{ row.status === 2 ? '已支付' : '未支付'
                                }}</el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作">
                        <template #default="{ row }">
                            <el-button v-if="row.status === 1" type="primary" size="small"
                                @click="handlePay(row.orderId)">立即支付</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页器 -->
            <div class="order-pagination">
                <el-pagination background layout="prev, pager, next" :total="filteredOrders.length"
                    :page-size="pageSize" v-model:current-page="currentPage" />
            </div>

            <!-- 收货信息弹窗 -->
            <el-dialog v-model="shippingDialogVisible" title="收货信息" width="500px">
                <div class="shipping-info-content" v-if="currentShippingInfo">
                    <div class="info-row">
                        <span class="info-label">订单编号：</span>
                        <span class="info-value">{{ currentOrderId }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">收货人：</span>
                        <span class="info-value">{{ currentShippingInfo.name }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">联系电话：</span>
                        <span class="info-value">{{ currentShippingInfo.phone }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">电子邮箱：</span>
                        <span class="info-value">{{ currentShippingInfo.email }}</span>
                    </div>
                </div>
                <template #footer>
                    <el-button type="primary" @click="shippingDialogVisible = false">确定</el-button>
                </template>
            </el-dialog>
        </div>
    </div>
</template>



<style scoped>
/* 外层容器样式 */
.order-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* 页面标题样式 */
h2 {
    font-size: 24px;
    color: #ffffff;
    margin: 0;
}

/* 订单卡片样式 */
.order-card {
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.order-header h2 {
    font-size: 24px;
    color: #ffffff;
    margin: 0;
}

.order-filter {
    width: 200px;
}

.order-list {
    margin-bottom: 20px;
}

.order-id {
    font-weight: bold;
    color: #0077FF;
}

.order-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.order-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.item-image {
    width: 60px;
    height: 35px;
    border-radius: 4px;
}

.item-info {
    flex: 1;
}

.item-name {
    font-weight: bold;
    margin-bottom: 4px;
}

.item-details {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #666;
}

.total-price {
    font-weight: bold;
    color: #ff6700;
}

.order-time {
    color: #666;
}

.order-pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

/* 收货信息弹窗样式 */
.shipping-info-content {
    padding: 10px 20px;
}

.info-row {
    margin-bottom: 15px;
    line-height: 1.6;
    display: flex;
}

.info-label {
    font-weight: bold;
    color: #666;
    width: 80px;
    flex-shrink: 0;
}

.info-value {
    color: #333;
    flex-grow: 1;
}
</style>