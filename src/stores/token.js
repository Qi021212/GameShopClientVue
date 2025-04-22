// src/stores/token.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTokenStore = defineStore('token', () => {
    const token = ref('');
    const isAuthenticated = ref(false);

    const setToken = (value) => {
        token.value = value;
    };

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