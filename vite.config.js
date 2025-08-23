// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import sitemap from './plugins/vite-plugin-sitemap';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      visualizer({
        template: 'treemap', // or sunburst
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'bundle-analyzer.html'
      }),
      sitemap({
        baseUrl: env.VITE_APP_URL || 'https://trackmyincome.vercel.app',
        // Additional pages can be added here
        pages: [
          { url: '/', changefreq: 'daily', priority: 1.0 },
          { url: '/pricing', changefreq: 'monthly', priority: 0.8 },
          { url: '/faq', changefreq: 'weekly', priority: 0.7 },
          { url: '/about', changefreq: 'monthly', priority: 0.6 },
          { url: '/login', changefreq: 'monthly', priority: 0.5 },
          { url: '/signup', changefreq: 'monthly', priority: 0.5 },
        ]
      })
    ],
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('@mui') || id.includes('@emotion')) {
                return 'vendor-mui';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('react')) {
                return 'vendor-react';
              }
              return 'vendor';
            }
          },
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash][extname]',
        }
      },
      chunkSizeWarningLimit: 1000, // Increase limit to 1000KB
    },
    server: {
      port: 3001, // Changed from 3000 to avoid conflict with backend
      open: true,
      proxy: {
        // Proxy API requests to the backend server
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'development'),
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    }
  };
});