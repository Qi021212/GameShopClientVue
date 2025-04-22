<script setup>
import { ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElRow, ElCol, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
const router = useRouter();

// 表单数据模型
const registerData = ref({
    username: '', 
    password: '',
    repeatedPassword: '',
    email: '',
});

// 表单验证规则
const rules = ref({
    username: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { max: 8, message: '名称长度不能超过8位', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 8, message: '密码长度不能少于 8 位', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: '密码必须包含数字和字母', trigger: 'blur' },
    ],
    repeatedPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value === registerData.value.password) {
                    callback();
                } else {
                    callback(new Error('两次输入的密码不一致'));
                }
            },
            trigger: 'blur',
        },
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ]
});

// 表单引用
const form = ref(null);

// 注册表单提交
import { RegisterService } from '@/api/user.js'; // 修正导入路径和方法名
const register = async () => {
    try {
        await form.value.validate();
        const result = await RegisterService(registerData.value);
        if (result.success) { // 后端返回 { message: "注册成功", success: true }
            ElMessage.success('注册成功！');
            router.push('/login'); // 注册成功后跳转到登录页
        } else {
            ElMessage.error(result.message || '注册失败');
        }
    } catch (error) {
        ElMessage.error(error.message || '注册失败');
    }
};
</script>

<template>
<div class="w">
    <div class="user-content">
        <div class="user-title">
            <img src="/src/assets/logo.png" alt="logo" id="logo"  class="user-title-logo">
            GameShop_Register
        </div>

        <el-form 
            :model="registerData" 
            :rules="rules" 
            ref="form" 
            class="user-form">
            <p class="login-tip">用户注册</p>

            <div class="user-form-item">
                <label for="username" class="user-form-label">
                    <i class="fa-solid fa-user"></i>
                </label>
                <!-- style格式有问题 -->
                <el-form-item prop="username">
                    <el-input 
                    v-model="registerData.username" 
                    placeholder="请输入名称"
                    class="user-form-input">
                    </el-input>
                </el-form-item>
            </div>
            <div id="username-feedback" class="feedback"></div>

            <div class="user-form-item">
                <label for="password" class="user-form-label">
                    <i class="fa-solid fa-lock"></i>
                </label>
                <!-- style格式有问题 -->
                <el-form-item prop="password">
                    <el-input 
                    v-model="registerData.password" 
                    placeholder="请输入密码"
                    class="user-form-input">
                    </el-input>
                </el-form-item>
            </div>
            <div id="password-feedback" class="feedback"></div>

            <div class="user-form-item">
                <label for="repeatPassword" class="user-form-label">
                    <i class="fa-solid fa-lock"></i>
                </label>
                <!-- style格式有问题 -->
                <el-form-item prop="repeatedPassword">
                    <el-input 
                    v-model="registerData.repeatedPassword" 
                    placeholder="请再次输入密码"
                    class="user-form-input">
                    </el-input>
                </el-form-item>
            </div>
            <div id="repeatPassword-feedback" class="feedback"></div>

            <div class="user-form-item">
                <label for="email" class="user-form-label">
                    <i class="fa-solid fa-envelope"></i>
                </label>
                <!-- style格式有问题 -->
                <el-form-item prop="email">
                    <el-input 
                    v-model="registerData.email" 
                    placeholder="请输入邮箱"
                    class="user-form-input">
                    </el-input>
                </el-form-item>
            </div>
            <div id="email-feedback" class="feedback"></div>
            <br>

            <div class="user-form-item">
                <el-button type="primary" @click="register" class="user-form-submit">注册</el-button>
            </div>
            <div class="user-form-link">
                <el-link type="primary" :underline="false" @click="router.push('/login')">返回登录>></el-link>
            </div>
        </el-form>
    </div>
</div>
</template>

<style scoped>
p {
padding: 0;
margin: 0;
}

.w{
width: 1080px;
height: 500px;
margin: 0 auto;
position: relative;
overflow: hidden;
background: #1b2838;
padding: 50px 0;
}

.user-content{
position: relative;
margin: 0 auto;
background: #171d25;
width: 400px;
align-items: center;
justify-content: start;
padding: 10px 20px; 
border-radius: 15px; 
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); 
border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-title{
position: relative;
text-align: left;
font-family:inherit;
font-style: italic;
padding: 10px 0;
text-align: center;
font-size: 30px;
font-weight: bold;
color: #fff;
border-bottom: 1px solid #999;
display: flex; align-items: center;
}

.user-title-logo{
height:  75px;
}

.user-form{
padding:20px;
}

.feedback {
color: #fff;
background-image: url('../images/warning.png');
background-repeat: no-repeat;
background-position: 2px 14px;
padding: 10px 0 0 22px;
}

.user-form-item{
position: relative;
margin-top: 20px;
}
.user-form-input{
padding: 10px 0 10px 50px;
width: 300px;
height: 1px;
line-height: 28px;
font-size: 15px;
border: 1px solid #bdbdbd;
outline: none;
}
.user-form-label{
position: absolute;
left: 1px;
top: 1px;
bottom: 1px;
width: 30px;
line-height: 22px;
background: #f3f3f3;
color: #d3d3d3;
text-align: center;
border-right: 1px solid #bdbdbd;
}

.user-form-submit{
width: 200px;
font-size: 20px;
margin-left: 80px;
padding: 2px 0 40px;
font-weight: bold;
height: 40px;
line-height: 40px;
border: none;
background: #215496;
color: #ffffff;
align-items: center;
justify-content: start;
padding: 0px 20px; /* �ڱ߾� */
border-radius: 15px; /* ����Բ�� */
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* ��Ӱ */
border: 1px solid rgba(255, 255, 255, 0.1); /* �߿���ɫ��͸���� */
}

.user-form-link{
text-align: right;
margin-right: 5px;
}
.link{
color: #999;
cursor: pointer;
font-size: 13px;
}
.link:hover{
color: #215496;
}

.user-form-error{
width: 300px;
position: relative;
padding: 4px 0 4px 40px;
color: red;
border: 1px solid red;
font-size: 14px;
margin-bottom: 10px;
}
.error-icon{
position: absolute;
left: 14px;
top: 50%;
margin-top: -7px;
}
</style>