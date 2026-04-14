import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /** 打包进 App 内 file:// 加载时，资源需相对路径 */
  base: './',
})
