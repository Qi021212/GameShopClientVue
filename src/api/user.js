import request from '@/utils/request';
import { useTokenStore } from '@/stores/token';
import { useUserInfoStore } from '@/stores/UserInfo';

// 获取验证码
export const getCaptchaService = (username) => {
    return request.get(`/api/captcha?username=${username}`, {
        responseType: 'blob'
    }).then(response => (response.data));
}
// 验证验证码
export const verifyCaptchaService = (username, captcha) => {
    return request.post('/api/captcha/verify', {
        username: username,
        captcha: captcha
    }).then(response => (response.data));
}

// 登录
export const loginService = (loginData) => {
    const urlSearchParams = new URLSearchParams();
    for (let key in loginData) {
        if (loginData[key] !== undefined && loginData[key] !== null) {
            urlSearchParams.append(key, loginData[key]);
        }
    }

    return request.get('/api/user?' + urlSearchParams)
        .then(response => {
            useUserInfoStore().setInfo(response.data); // 使用 Pinia 的 userInfo store
            useTokenStore().setToken(response.data.token); // 使用 Pinia 的 token store
            return response.data;
        })
};
// 注册
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

// 用户信息
export const userInfoService = (id) => {
    return request.get(`/api/user/${id}`)
        .then(response => response.data);
};
// 修改用户信息
export const updateUserInfoService = (userInfoData) => {
    const tokenStore = useTokenStore();
    return request.post(`/api/user/${userInfoData.id}`, userInfoData, { // 使用 request 替代 axios
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.data);
};

// 查看游戏库
export const getGameList = async (id) => {
    try {
        const response = await request.get(`/games/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('获取游戏库列表失败');
    }
};
