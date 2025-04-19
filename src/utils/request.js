import axios from 'axios'
import { useTokenStore } from '@/stores/token'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // API base URL
  timeout: 5000, // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const tokenStore = useTokenStore()
    
    // 如果token存在，则在请求头中添加token
    if (tokenStore.token) {
      config.headers['Authorization'] = `Bearer ${tokenStore.token}`
    }

    return config
  },
  error => {
    // 请求错误处理
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
    (response) => {
      console.log('Interceptor received:', response.data);
      return response;
    },
    (error) => {
      console.error('Interceptor error:', error.response ? error.response.data : error);
      return Promise.reject(error);
    }
  );

  export default request;