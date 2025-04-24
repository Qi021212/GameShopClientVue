<script setup>
import { ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElIcon } from 'element-plus';
import { User, Lock, Message } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const registerData = ref({
  username: '',
  password: '',
  repeatedPassword: '',
  email: '',
});

const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 8, message: '用户名长度不能超过8位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
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

const form = ref(null);

import { RegisterService } from '@/api/user.js';
const register = async () => {
  try {
    await form.value.validate();
    const result = await RegisterService(registerData.value);
    if (result.success) {
      ElMessage.success('注册成功！');
      router.push('/login');
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
        <img src="/src/assets/logo.png" alt="logo" id="logo" class="user-title-logo">
        GameShop_Register
      </div>
      
      <el-form 
        :model="registerData" 
        :rules="rules" 
        ref="form" 
        class="user-form">
        <div class="user-form-item">
          <el-form-item prop="username">
            <div class="input-with-icon">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input 
                v-model="registerData.username" 
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
                v-model="registerData.password" 
                placeholder="请输入密码"
                type="password"
                show-password
                class="user-form-input no-border-input">
              </el-input>
            </div>
          </el-form-item>
        </div>

        <div class="user-form-item">
          <el-form-item prop="repeatedPassword">
            <div class="input-with-icon">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input 
                v-model="registerData.repeatedPassword" 
                placeholder="请再次输入密码"
                type="password"
                show-password
                class="user-form-input no-border-input">
              </el-input>
            </div>
          </el-form-item>
        </div>

        <div class="user-form-item">
          <el-form-item prop="email">
            <div class="input-with-icon">
              <el-icon class="input-icon"><Message /></el-icon>
              <el-input 
                v-model="registerData.email" 
                placeholder="请输入邮箱"
                class="user-form-input no-border-input">
              </el-input>
            </div>
          </el-form-item>
        </div>

        <div class="user-form-item">
          <el-button 
            type="primary" 
            @click="register" 
            class="user-form-submit">
            注册
          </el-button>
        </div>
        
        <div class="user-form-link">
          <el-link 
            type="primary" 
            :underline="false" 
            @click="router.push('/login')">
            返回登录>>
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

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

/* 错误提示 */
.feedback {
  color: #fff;
  background-image: url('../images/warning.png');
  background-repeat: no-repeat;
  background-position: 2px 14px;
  padding: 10px 0 0 22px;
}
</style>