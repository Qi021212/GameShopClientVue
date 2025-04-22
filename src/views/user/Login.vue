<template>
<div class="w">
    <div class="user-content">
        <div class="user-title">
            <img src="/src/assets/logo.png" alt="logo" id="logo"  class="user-title-logo">
            GameShop_Login
        </div>
        <el-form 
            :model="loginData" 
            :rules="rules"
            ref="form"
            class="user-form">
            <p class="login-tip">用账户名称登录</p>
            
            <div class="user-form-item">
                <label for="username" class="user-form-label">
                </label>
                <!-- style格式有问题 -->
                <el-form-item prop="username">
                    <el-input 
                    v-model="loginData.username" 
                    placeholder="请输入名称"
                    class="user-form-input">
                    </el-input>
                </el-form-item>
            </div>

            <div class="user-form-item">
                <label for="password" class="user-form-label">
                    <i class="fa-solid fa-lock"></i>
                </label>
                <!-- style格式有问题 -->
                <el-form-item prop="password">
                    <el-input 
                    v-model="loginData.password" 
                    placeholder="请输入密码"
                    class="user-form-input">
                    </el-input>
                </el-form-item>
            </div>
            <br>

            <div class="captcha-container">
                <!-- style格式有问题 -->
                <el-form-item prop="captcha">
                    <el-input 
                    v-model="loginData.captcha" 
                    placeholder="请输入验证码"
                    class="user-form-input">
                    </el-input>
                </el-form-item>
                <img 
                        :src="captchaUrl" 
                        alt="验证码" 
                        class="captcha-image"
                        @click="refreshCaptcha"
                />
            </div>

            <div v-if="errorMsg" class="feedback">
                <p class="error-msg">{{ errorMsg }}</p>
            </div>

            <div class="user-form-item">
                <el-button type="primary" @click="login" class="user-form-submit">登录</el-button>
            </div>
            <div class="user-form-link">
                <el-link type="primary" :underline="false" @click="router.push('/register')">还没有GameShop账户？点击这里</el-link>
            </div>
    </el-form>
    </div>
</div>
</template>


<script setup>
import { ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElRow, ElCol, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
//import { useUserInfoStore } from '@/stores/UserInfo';
import { useTokenStore } from '@/stores/token';
import { loginService } from '@/api/user.js';

const router = useRouter();
const tokenStore = useTokenStore();

const loginData = ref({
    username: '',
    password: ''
});

const rules = ref({
    username: [
        { required: true, message: '请输入名称', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
});

const form = ref(null);

const login = async () => {
    try {
        await form.value.validate();
        console.log(loginData.value);
        const result = await loginService(loginData.value);
        if (result.code === 200) {
            ElMessage.success('登录成功');
            tokenStore.login(result.token);
            //useUserInfoStore.setInfo(result.data);
            router.push('/user'); // 直接跳转到 
        } else {
            ElMessage.error(result.message || '登录失败');
        }
    } catch (error) {
        ElMessage.error(error.message || '登录失败');
    }
};
</script>

<style scoped>
p {
padding: 0;
margin: 0;
}

.w {
width: 1080px;
height: 500px;
margin: 0 auto;
position: relative;
overflow: hidden;
background: #1b2838;
padding: 50px 0;
}

.user-content {
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

.feedback {
color: #fff;
background-image: url('../images/warning.png');
background-repeat: no-repeat;
background-position: 2px 14px;
padding: 10px 0 0 22px;
}

.user-title {
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

.user-title-logo {
height:  75px;
}

.captcha-container {
display: flex; 
align-items: center; 
gap: 10px; 
}

.captcha-input {
height: 20px; 
padding: 5px; 
font-size: 16px;
flex: 1; 
}

.captcha-image {
width: 100px; 
height: auto;
}

.user-form {
padding:20px;
}

.user-form-item {
position: relative;
margin-top: 20px;
}

.user-form-input {
padding: 10px 0 10px 50px;
width: 300px;
height: 1px;
line-height: 28px;
font-size: 15px;
border: 1px solid #bdbdbd;
outline: none;
}

.user-form-label {
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

.user-form-submit {
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
padding: 0px 20px; 
border-radius: 15px; 
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); 
border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-form-link {
text-align: right;
margin-right: 5px;
}

.link {
color: #999;
cursor: pointer;
font-size: 13px;
}

.link:hover {
color: #215496;
}

.user-form-error {
width: 300px;
position: relative;
padding: 4px 0 4px 40px;
color: red;
border: 1px solid red;
font-size: 14px;
margin-bottom: 10px;
}

.error-icon {
position: absolute;
left: 14px;
top: 50%;
margin-top: -7px;
}
</style>