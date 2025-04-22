<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/UserInfo';
import { updateUserInfoService } from '@/api/user.js';
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton, ElCard, ElRow, ElCol } from 'element-plus';
import { use } from 'echarts';

const router = useRouter();
const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

const localUserInfo = ref({
    id: useUserInfoStore().info.data.id,
    username: useUserInfoStore().info.data.username,
    email: useUserInfoStore().info.data.email
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
        const id = useUserInfoStore().info.data.id; 
        if (!id || isNaN(id)) {
            ElMessage.error('无法获取ID，请重新登录');
            router.push('/');
            return;
        }
        await useUserInfoStore().fetchUserInfo(id);
        localUserInfo.value = JSON.parse(JSON.stringify(userInfoStore.info));
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
            userInfoStore.setInfo(localUserInfo.value);
        } else {
            ElMessage.error(result.message || '修改失败');
        }
    } catch (error) {
        ElMessage.error(error.message || '修改失败');
    }
};
</script>

<template>
<!-- <div id="top"></div> -->

<el-form 
    :model="localUserInfo" 
    :rules="rules" 
    ref="form" 
    label-width="100px" 
    size="large">
    <div>
        <table class="userInfo">
        <tbody>
            <tr>
                <td rowspan="3"><img src="/src/assets/img.png" alt="head portrait"></td>
                <td>ID:</td>
                <td>
                <el-form-item label="ID" prop="id">
                    <el-input v-model="localUserInfo.id" disabled></el-input>
                </el-form-item>
                </td>
            </tr>
            <tr>
                <td>昵称:</td>
                <td>
                    <el-form-item label="名称" prop="username">
                        <el-input v-model="localUserInfo.username"></el-input>
                    </el-form-item>
                </td>
            </tr>
            <tr>
                <td>邮箱:</td>
                <td>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="localUserInfo.email"></el-input>
                    </el-form-item>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <el-form-item>
                        <el-button type="primary" @click="updateUser">提交修改</el-button>
                    </el-form-item>
                </td>
            </tr> 
        </tbody>
        </table>
    </div>
</el-form>
</template>

<style scoped>
/*userInfo*/
/*个人信息*/
table.userinfo {
    width: 780px;
    height: 400px;
    background-color: #1a2127;
    color: #a5bec3;
    border-collapse: collapse;
    margin: 100px auto;
}

.userinfo td {
    padding: 28px;
    font-size: 22px;
}

.editBtn {
    width: 100px;
    height: 40px;
    font-size: 15px;
    background-color: #223d57;
    color: #f3f3f3;
    border: 1px solid #1b2838;
    float: right;
    border-radius: 4px;
}

.editBtn:hover {
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
}
</style>