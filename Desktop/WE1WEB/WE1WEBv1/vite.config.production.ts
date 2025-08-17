import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

// Production-optimized Vite configuration
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files larger than 10kb
    }),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
    // Bundle analyzer (optional, remove in production)
    process.env.ANALYZE && visualizer({
      open: true,
      filename: 'dist/bundle-analysis.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false, // Remove comments
      },
    },
    rollupOptions: {
      output: {
        // Optimize chunk splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-hook-form'],
          'ui-vendor': ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-slot'],
          'utils': ['date-fns', 'clsx', 'tailwind-merge'],
          'supabase': ['@supabase/supabase-js'],
          'stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
        // Asset naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Performance optimizations
    chunkSizeWarningLimit: 1000, // Warn for chunks larger than 1MB
    cssCodeSplit: true,
    reportCompressedSize: false, // Faster builds
    // Optimize dependencies
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  
  // Production optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'framer-motion',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  
  // Server configuration for preview
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
  
  // Environment variable configuration
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __DEV__: false,
    __PROD__: true,
  },
  
  // CSS optimization
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')({
          preset: 'advanced',
        }),
      ],
    },
  },
});