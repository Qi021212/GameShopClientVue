<template>
  <div class="w">
    <div class="user-content">
      <div class="user-title">
        <img src="/src/assets/logo.png" alt="logo" id="logo" class="user-title-logo">
        GameShop_Login
      </div>
      <el-form 
        :model="loginData" 
        :rules="rules"
        ref="form"
        class="user-form">
        <div class="user-form-item">
          <el-form-item prop="username">
            <div class="input-with-icon">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input 
                v-model="loginData.username" 
                placeholder="请输入用户名"
                class="user-form-input no-border-input">
              </el-input>
            </div>
          </el-form-item>
        </div>

        <div class="user-form-item">
          <el-form-item prop="password">
            <div class="input-with-icon">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input 
                v-model="loginData.password" 
                placeholder="请输入密码"
                type="password"
                show-password
                class="user-form-input no-border-input">
              </el-input>
            </div>
          </el-form-item>
        </div>

        <div class="captcha-container">
          <el-form-item prop="captcha">
            <div class="input-with-icon">
              <el-icon class="input-icon"><Picture /></el-icon>
              <el-input 
                v-model="loginData.captcha" 
                placeholder="请输入验证码"
                class="user-form-input no-border-input captcha-input">
              </el-input>
            </div>
          </el-form-item>
          <img 
            v-if="loginData.captchaUrl"
            :src="loginData.captchaUrl" 
            alt="验证码" 
            class="captcha-image"
            @click="refreshCaptcha"
          />
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
import { ref, onMounted } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElIcon } from 'element-plus';
import { User, Lock, Picture } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useUserInfoStore } from '@/stores/UserInfo';
import { useTokenStore } from '@/stores/token';
import { loginService, getCaptchaService, verifyCaptchaService } from '@/api/user.js';

const router = useRouter();
const tokenStore = useTokenStore();

const loginData = ref({
  username: '',
  password: '',
  captcha: '',
  captchaUrl: '',
  captchaUsername: ''
});

const refreshCaptcha = async () => {
  try {
    const username = loginData.value.username || 'defaultUser';
    const response = await getCaptchaService(username);
    
    loginData.value.captchaUsername = username;
    
    if (loginData.value.captchaUrl) URL.revokeObjectURL(loginData.value.captchaUrl);
    const blob = new Blob([response], { type: 'image/png' });
    loginData.value.captchaUrl = URL.createObjectURL(blob);
  } catch (error) {
    ElMessage.error('验证码加载失败');
    console.error('验证码获取失败:', error);
  }
};

const verifyCaptcha = async () => {
  try {
    const response = await verifyCaptchaService(loginData.value.captchaUsername, loginData.value.captcha);
    return response.valid;
  } catch (error) {
    console.error('验证码验证失败:', error);
    return false;
  }
};

onMounted(() => {
  refreshCaptcha();
});

const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度为4到6个字符', trigger: 'blur' }
  ]
});

const form = ref(null);

const login = async () => {
  try {
    await form.value.validate();
    const isCaptchaValid = await verifyCaptcha();
    if (!isCaptchaValid) {
      ElMessage.error('验证码错误');
      refreshCaptcha();
      loginData.value.captcha = '';
      return;
    }

    const result = await loginService({
      username: loginData.value.username,
      password: loginData.value.password
    });
    
    if (result.code === 200) {
      ElMessage.success('登录成功');
      tokenStore.login(result.token);
      useUserInfoStore().setInfo(result.data);
      console.log('登录成功:', result.data);
      router.push('/');
    } else {
      refreshCaptcha();
      loginData.value.captcha = '';
      ElMessage.error(result.message || '登录失败');
    }
  } catch (error) {
    refreshCaptcha();
    loginData.value.captcha = '';
    ElMessage.error(error.message || '登录失败');
  }
};
</script>

<style scoped>
/* 基础样式 */
p {
  padding: 0;
  margin: 0;
}

/* 主容器 */
.w {
  width: 1080px;
  height: 500px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background: #1b2838;
  padding: 50px 0;
}

/* 登录卡片 */
.user-content {
  position: relative;
  margin: 0 auto;
  background: #171d25;
  width: 400px;
  padding: 10px 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 标题区域 */
.user-title {
  position: relative;
  text-align: center;
  font-family: inherit;
  font-style: italic;
  padding: 10px 0;
  font-size: 30px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid #999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-title-logo {
  height: 75px;
}

.login-tip {
  color: #a7a7a7;
  text-align: center;
  margin-bottom: 10px;
  font-size: 14px;
}

/* 表单区域 */
.user-form {
  padding: 20px;
}

.user-form-item {
  position: relative;
  margin-top: 20px;
}

/* 输入框容器 */
.input-with-icon {
  position: relative;
  width: 400px;
}

/* 图标样式 */
.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  z-index: 2;
  font-size: 16px;
}

/* 无边框输入框 */
.no-border-input :deep(.el-input__wrapper) {
  background: #ffffff;
  box-shadow: none !important;
  border: none !important;
  padding-left: 40px;
}

.no-border-input :deep(.el-input__inner) {
  color: #333;
}

.user-form-input {
  width: 100%;
  height: 40px;
}

/* 验证码区域 */
.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-input {
  width: 180px !important;
}

.captcha-image {
  width: 100px;
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
}


/* 登录按钮 */
.user-form-submit {
  width: 200px;
  height: 40px;
  margin-left: 80px;
  font-size: 16px;
  font-weight: bold;
  background: #215496;
  color: #ffffff;
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background 0.3s;
}

.user-form-submit:hover {
  background: #1a4680;
}

/* 注册链接 */
.user-form-link {
  text-align: right;
  margin-right: 5px;
  margin-top: 15px;
}

:deep(.el-link) {
  color: #999;
  font-size: 13px;
  transition: color 0.3s;
}

:deep(.el-link:hover) {
  color: #215496;
}
</style>