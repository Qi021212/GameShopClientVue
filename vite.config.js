import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // 确保指向 src 目录
    }
  },
  //解决跨域问题
  server: {
    proxy: {
      '/api': {//获取路径中包含了/api的请求，就会被代理到http://localhost:8080
        target: 'http://localhost:8080',//代理的目标地址
        changeOrigin: true,//修改源
        rewrite: (path) => path.replace(/^\/api/, '')//重写路径
      }
    }
  }
})
