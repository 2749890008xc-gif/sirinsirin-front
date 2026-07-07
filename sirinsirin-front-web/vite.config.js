import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      //  表示指定@为./src路径，例如：@/assets === ./src/assets
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 3000,   //  将当前项目端口改为3000
    open: true,
    hmr: true,
    proxy: {
      "/api": {
        // target: "http://localhost:7071/",
        target: "http://localhost:7079/",  //  微服务
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // ✅ 新增：透传设备A的真实IP到后端（核心修复）
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 获取设备A的真实局域网IP
            const clientIp = req.connection.remoteAddress;
            // 把真实IP写入请求头，后端可以读取到
            proxyReq.setHeader('X-Real-IP', clientIp);
            proxyReq.setHeader('X-Forwarded-For', clientIp);
          });
        }
      }
    },
    // host: '192.168.1.103',
    host: 'localhost',
  },
  build: {
    // 禁用生产环境的 Source Map
    sourceMap: false,
    // 开启代码压缩混淆
    minify: 'esbuild',
    terserOptions: {
      compress: {
        // drop_console: true, // 移除所有 console.log
        // drop_debugger: true // 移除 debugger 断点
      }
    },
  }
})
