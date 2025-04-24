<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
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


// 收货信息表单
const shippingForm = ref({
    name: '',
    phone: '',
    email: '',
})

// 表单验证规则
const shippingRules = {
    name: [
        { required: true, message: '请输入收货人姓名', trigger: 'blur' },
        { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ],
}

// 支付相关状态
const showPayment = ref(false)
const selectedPayment = ref(1)
const shippingFormRef = ref()

// 提交收货信息
const submitShippingInfo = () => {
    shippingFormRef.value.validate((valid) => {
        if (valid) {
            showPayment.value = true
        } else {
            ElMessage.error('请填写完整的收货信息')
            return false
        }
    })
}

// 支付方式选择
const handlePayment = () => {
    ElMessageBox.confirm(
        `确认使用${getPaymentMethodName(selectedPayment.value)}支付吗？`,
        '支付确认',
        {
            confirmButtonText: '确认支付',
            cancelButtonText: '取消支付',
            type: 'warning',
            distinguishCancelAndClose: true // 区分取消和关闭
        }
    ).then(() => {
        // 确认支付 - 调用支付接口
        submitOrder(true) // true表示已支付
    }).catch((action) => {
        if (action === 'cancel') {
            // 取消支付 - 创建未支付订单
            submitOrder(false) // false表示未支付
        }
    })
}

// 创建订单
import { createOrder,updateOrderStatus } from '@/api/order.js'
const submitOrder = async (isPaid) => {
    try {
        // 组装订单数据
        const orderData = {
            userId: localUserInfo.value.id,
            name: shippingForm.value.name,
            phone: shippingForm.value.phone,
            email: shippingForm.value.email,
            payType: selectedPayment.value,
        }
        // 调用API提交订单
        const response = await createOrder(orderData);
        if (response) {
            const orderId = response.orderId;
            console.log('订单ID:', orderId)
            if(isPaid) {
                // 支付成功逻辑
                await updateOrderStatus(orderId);
                ElMessage.success('支付成功！')
            } else {
                // 创建订单成功但未支付逻辑
                ElMessage.success('订单已创建（待支付）')
            }
            router.push('/orders');
        }
    } catch (error) {
        ElMessage.error(`订单提交失败: ${error.message}`)
    }
}

// 获取支付方式名称
const getPaymentMethodName = (payType) => {
    const methods = {
        1: '支付宝',
        2: '微信支付',
    }
    return methods[payType] || payType
}

onMounted(() => {
  getUserInfo();
})
</script>

<template>
    <div class="checkout-container">
        <div class="cart-header">
            <h2>订单结算</h2>
        </div>
        <div class="checkout-card">
            <!-- 收货信息表单 -->
            <div class="shipping-form">
                <h3>收货信息</h3>
                <el-form :model="shippingForm" :rules="shippingRules" ref="shippingFormRef" label-width="100px"
                    label-position="top">
                    <el-form-item label="收货人姓名" prop="name">
                        <el-input v-model="shippingForm.name" placeholder="请输入收货人姓名"></el-input>
                    </el-form-item>
                    <el-form-item label="联系电话" prop="phone">
                        <el-input v-model="shippingForm.phone" placeholder="请输入联系电话"></el-input>
                    </el-form-item>
                    <el-form-item label="电子邮箱" prop="email">
                        <el-input v-model="shippingForm.email" placeholder="请输入电子邮箱"></el-input>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 支付方式选择 -->
            <div class="payment-methods" v-if="showPayment">
                <h3>选择支付方式</h3>
                <div class="payment-options">
                    <el-radio-group v-model="selectedPayment">
                        <el-radio label="1" border>
                            <div class="payment-option">
                                <img src="../../assets/alipay.png" alt="支付宝">
                                <span>支付宝</span>
                            </div>
                        </el-radio>
                        <el-radio label="2" border>
                            <div class="payment-option">
                                <img src="../../assets/wechat.png"
                                    alt="微信支付">
                                <span>微信支付</span>
                            </div>
                        </el-radio>
                    </el-radio-group>
                </div>
                <div class="payment-actions">
                    <el-button @click="showPayment = false">返回修改</el-button>
                    <el-button type="primary" @click="handlePayment">立即支付</el-button>
                </div>
            </div>

            <!-- 提交按钮 -->
            <div class="checkout-actions" v-if="!showPayment">
                <el-button type="primary" @click="submitShippingInfo">提交订单</el-button>
            </div>
        </div>
    </div>
</template>



<style scoped>
.checkout-container {
    max-width: 800px;
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


.checkout-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 10px 20px;
}


.shipping-form h3,
.payment-methods h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}


.shipping-form {
    margin-bottom: 30px;
}

.payment-methods {
    margin-top: 30px;
}

.payment-options {
    margin: 20px 0;
}

.payment-option {
    display: flex;
    align-items: center;
    padding: 10px 15px;
}

.payment-option img {
    width: 24px;
    height: 24px;
    margin-right: 10px;
}

.payment-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 20px;
}

.checkout-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

:deep(.el-radio.is-bordered) {
    margin-right: 15px;
    margin-bottom: 15px;
    padding: 10px 15px;
}

:deep(.el-radio__input) {
    display: none;
}
</style>