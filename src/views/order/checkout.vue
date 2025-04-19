<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter() 
import { ElMessage, ElMessageBox } from 'element-plus'

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
const selectedPayment = ref('alipay')
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

// 处理支付
const handlePayment = () => {
    ElMessageBox.confirm(`确认使用${getPaymentMethodName(selectedPayment.value)}支付吗？`, '支付确认', {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 这里应该是调用支付接口
        // 模拟支付成功
        setTimeout(() => {
            ElMessage.success('支付成功！订单已生成')
            router.push('/orders') // 跳转到支付成功页面
        }, 1000)
    })
}

// 获取支付方式名称
const getPaymentMethodName = (method) => {
    const methods = {
        alipay: '支付宝',
        wechat: '微信支付',
    }
    return methods[method] || method
}
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
                        <el-radio label="alipay" border>
                            <div class="payment-option">
                                <img src="https://img.alicdn.com/tfs/TB1G5WgjXY7gK0jSZKzXXaikpXa-200-200.png" alt="支付宝">
                                <span>支付宝</span>
                            </div>
                        </el-radio>
                        <el-radio label="wechat" border>
                            <div class="payment-option">
                                <img src="https://img.alicdn.com/tfs/TB1Z0PywTtYBeNjy1XdXXXXyVXa-200-200.png"
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