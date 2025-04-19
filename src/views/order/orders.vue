<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 订单数据
const orders = ref([
  {
    orderId: '0001',
    items: [
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
      }
    ],
    total: 696.00,
    orderTime: '2023-05-15T14:30:00',
    shippingInfo: {
      name: '张三',
      phone: '13800138000',
      email: 'zhangsan@example.com',
    },
    paymentMethod: 'alipay',
    isPaid: true
  },
  {
    orderId: '0002',
    items: [
      {
        id: 3,
        name: '只狼：影逝二度',
        version: '年度版',
        price: 268.00,
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg'
      }
    ],
    total: 268.00,
    orderTime: '2023-05-16T09:15:00',
    shippingInfo: {
      name: '李四',
      phone: '13900139000',
      email: 'lisi@example.com',
    },
    paymentMethod: 'wechat',
    isPaid: false
  }
])

// 筛选状态
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = 5

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
    alipay: '支付宝',
    wechat: '微信支付',
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

// 过滤订单
const filteredOrders = computed(() => {
  let result = orders.value
  if (filterStatus.value) {
    if (filterStatus.value === 'unpaid') {
      result = result.filter(order => !order.isPaid)
    } else if (filterStatus.value === 'paid') {
      result = result.filter(order => order.isPaid)
    } 
  }
  return result
})

// 支付订单
const handlePay = (orderId) => {
  ElMessageBox.confirm('确认支付该订单吗？', '支付确认', {
    confirmButtonText: '确认支付',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const order = orders.value.find(o => o.orderId === orderId)
    if (order) {
      order.isPaid = true
      ElMessage.success('支付成功！')
    }
  })
}

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
                <el-table :data="filteredOrders" style="width: 100%" row-key="orderId">
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
                                        <div class="item-name">{{ item.name }}</div>
                                        <div class="item-details">
                                            <span class="item-version">{{ item.version }}</span>
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
                            <span class="order-time">{{ formatTime(row.orderTime) }}</span>
                        </template>
                    </el-table-column>
            
                    <el-table-column label="收货信息" width="120">
                        <template #default="{ row }">
                            <el-button type="text" @click="showShippingInfo(row)">查看收货信息</el-button>
                        </template>
                    </el-table-column>
            
                    <el-table-column prop="paymentMethod" label="支付方式" width="100">
                        <template #default="{ row }">
                            <el-tag :type="getPaymentTagType(row.paymentMethod)">{{ getPaymentMethodName(row.paymentMethod) }}</el-tag>
                        </template>
                    </el-table-column>
            
                    <el-table-column prop="isPaid" label="支付状态" width="100">
                        <template #default="{ row }">
                            <el-tag :type="row.isPaid ? 'success' : 'danger'">{{ row.isPaid ? '已支付' : '未支付' }}</el-tag>
                        </template>
                    </el-table-column>
            
                    <el-table-column label="操作" width="180">
                        <template #default="{ row }">
                            <el-button v-if="!row.isPaid" type="primary" size="small" @click="handlePay(row.orderId)">立即支付</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        
            <!-- 分页器 -->
            <div class="order-pagination">
                <el-pagination background layout="prev, pager, next" :total="filteredOrders.length" :page-size="pageSize" v-model:current-page="currentPage"/>
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