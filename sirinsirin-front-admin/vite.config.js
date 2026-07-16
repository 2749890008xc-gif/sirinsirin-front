import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/admin',
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
    port: 3001,
    open: true,
    hmr: true,
    proxy: {
      "/admin-api": {
        // target: "http://localhost:7070/",
        target: "http://localhost:7079/",  //  微服务
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/admin-api/, '/admin'),
      }
    }
  }
})
