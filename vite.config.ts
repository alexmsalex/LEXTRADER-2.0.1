import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: './', // Necessário para Electron carregar assets com caminho relativo
    define: {
      // Polyfill para suportar 'process.env.API_KEY' no código existente
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': process.env
    },
    server: {
      port: 5173
    }
  };
});