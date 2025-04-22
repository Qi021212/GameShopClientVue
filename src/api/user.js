import request from '@/utils/request';
import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/UserInfo';

export const loginService = (loginData) => {
    const urlSearchParams = new URLSearchParams();
    for (let key in loginData) {
        if (loginData[key] !== undefined && loginData[key] !== null) {
            urlSearchParams.append(key, loginData[key]);
        }
    }

    return request.get('/api/user?'+urlSearchParams)
            .then(response => {
                useUserInfoStore().setInfo(response.data); // 使用 Pinia 的 userInfo store
                useTokenStore().setToken(response.data.token); // 使用 Pinia 的 token store
                return response.data;
            })
};

export const RegisterService = (registerData) => {
    const urlSearchParams = new URLSearchParams();
    for (let key in registerData) {
        if (registerData[key] !== undefined && registerData[key] !== null) {
            urlSearchParams.append(key, registerData[key]); // 修正：使用 registerData[key]
        }
    }

    return request.post('/api/user', urlSearchParams, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => response.data);
};

export const userInfoService = (id) => {
    return request.get(`/api/user/${id}`)
        .then(response => response.data);
};

export const updateUserInfoService = (userInfoData) => {
    const tokenStore = useTokenStore();
    return request.post(`/api/user/${userInfoData.id}`, userInfoData, { // 使用 request 替代 axios
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.data);
};