<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/UserInfo';
import { updateUserInfoService } from '@/api/user.js';
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton, ElCard, ElRow, ElCol } from 'element-plus';

const router = useRouter();
const tokenStore = useTokenStore();

const localUserInfo = ref({
    id: useUserInfoStore().info.id,
    username: useUserInfoStore().info.username,
    email: useUserInfoStore().info.email
});

const form = ref(null);

const rules = ref({
    merchantname: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { pattern: /^\S{2,20}$/, message: '名称必须是2-20位的非空字符串', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ]
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
        ElMessage.error(error.message || '获取信息失败');
    }
};

onMounted(() => {
    getUserInfo();
});

const updateUser = async () => {
    try {
        await form.value.validate();
        const result = await updateUserInfoService(localUserInfo.value);
        if (result.success) {
            ElMessage.success(result.message || '修改成功');
            useUserInfoStore().setInfo(localUserInfo.value);
        } else {
            ElMessage.error(result.message || '修改失败');
        }
    } catch (error) {
        ElMessage.error(error.message || '修改失败');
    }
};
</script>

<template>
  <div class="user-container">
    <div class="user-header">
      <h2>个人信息</h2>
    </div>
    
    <div class="user-content">
      <el-card class="user-card">
        <el-form 
          :model="localUserInfo" 
          :rules="rules" 
          ref="form" 
          label-width="100px" 
          size="large">
          <div class="user-info-wrapper">
            <div class="avatar-section">
              <img src="/src/assets/img.png" alt="头像" class="avatar">
            </div>
            
            <div class="info-section">
              <el-form-item label="ID" prop="id">
                <el-input v-model="localUserInfo.id" disabled></el-input>
              </el-form-item>
              
              <el-form-item label="用户名" prop="username">
                <el-input v-model="localUserInfo.username"></el-input>
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="localUserInfo.email"></el-input>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="updateUser" class="submit-btn">保存修改</el-button>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.user-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-header {
    display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.user-header h2 {
  font-size: 24px;
  color: #ffffff;
  margin: 0;
}

.user-content {
  padding: 0 20;
}

.user-card {
  border: none;
  box-shadow: none;
}

.user-info-wrapper {
  display: flex;
  gap: 40px;
}

.avatar-section {
  flex: 0 0 150px;
  display: flex;
  justify-content: center;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eee;
}

.info-section {
  flex: 1;
}

.submit-btn {
  width: 200px;
  height: 40px;
  font-size: 16px;
  background-color: #409eff;
  border-color: #409eff;
}

.submit-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-info-wrapper {
    flex-direction: column;
    align-items: center;
  }
  
  .info-section {
    width: 100%;
  }
  
  .submit-btn {
    width: 100%;
  }
}

.el-form-item {
  margin-bottom: 22px;
}

.el-input {
  width: 100%;
}
</style>