import { defineStore } from "pinia";
import { ref } from "vue";
import { userInfoService } from '@/api/user';

export const useUserInfoStore = defineStore('userInfo', () => {
    const info = ref({});

    const setInfo = (value) => {
        info.value = value;
        
    };

    const removeInfo = () => {
        info.value = {};
    };

    const fetchUserInfo = async (id) => {
        try {
            const result = await userInfoService(id);
            if (result.success && result.data) {
                info.value = result.data;
            } else {
                throw new Error(result.message || '获取信息失败');
            }
        } catch (error) {
            throw error;
        }
    };

    return {
        info,
        setInfo,
        removeInfo,
        fetchUserInfo
    };
}, {
    persist: true
});