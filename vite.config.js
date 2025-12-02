import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/gameworld/', // REPO ADIN NEYSE ONU YAZDIN (doğru)
  server: {
    historyApiFallback: true,
  },
});
