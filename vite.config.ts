import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { execSync } from 'node:child_process'

// https://vitejs.dev/config/
export default defineConfig({
  // nginx의 location하고, router의 경로가 모두 일치해야함
  // https://chat.openai.com/share/4fbfe114-d077-426a-9801-881df8465e83
  // base: '/aivera/',
  plugins: [vue(), vueJsx()],
  define: {
    __GIT_SHA__: JSON.stringify(execSync('git rev-parse --short HEAD').toString().trim())
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      // API요청을 프록시할 링크
      '/api': {
        target: 'https://choigawoon.site/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
