import axios from "axios";
import { useTokenStore } from "@/stores/token";

const baserURL = '/api';
const request = axios.create({
  baseURL: baserURL,
  timeout: 50000
});

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log('Interceptor received:', response.data);
    return response;
  },
  (error) => {
    console.error('Interceptor error:', error.response ? error.response.data : error);
    return Promise.reject(error);
  }
);

// 请求拦截器
request.interceptors.request.use(
  config => {
    const tokenStore = useTokenStore();
    const token = tokenStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 确保添加 Bearer 前缀
    }
    return config;
  },
  error => Promise.reject(error)
);

export default request;