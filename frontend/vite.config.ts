import { defineConfig } from 'vite';
import stringPlugin from 'vite-plugin-string';


// https://vitejs.dev/config/
export default defineConfig({
  // Entry point for your application
  root: '',  
  build: {
    outDir: 'dist',  // Output directory for production build
    sourcemap: true,    // Enable sourcemaps for easier debugging
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';  // Separate vendor dependencies
          }
        },
      },
    },
  },
  plugins: [
    stringPlugin({
      include: '**/*.html' // Optionally, specify which HTML files to include
    })
  ]
});

