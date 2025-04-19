// src/stores/token.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTokenStore = defineStore('token', () => {
    //响应式变量
    const token = ref('');

    const isAuthenticated = ref(false);

    //修改token的函数
    const setToken = (value) => {
        token.value = value;
    };
    //移除token的函数
    const removeToken = () => {
        token.value = '';
    };

    const login = (tokenValue) => {
        isAuthenticated.value = true;
        token.value = tokenValue;
    };

    const logout = () => {
        isAuthenticated.value = false;
        token.value = '';
    };

    return {
        token,
        isAuthenticated,
        setToken,
        removeToken,
        login,
        logout
    };
}, {
    persist: true
});