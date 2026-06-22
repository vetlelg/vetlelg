import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vetlelg/',
  build: {
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'three-core',
              test: /node_modules[\\/]three[\\/]/,
              priority: 30,
            },
            {
              name: 'react-three-fiber',
              test: /node_modules[\\/]@react-three[\\/]fiber[\\/]/,
              priority: 25,
            },
            {
              name: 'drei',
              test: /node_modules[\\/]@react-three[\\/]drei[\\/]/,
              priority: 20,
            },
            {
              name: 'postprocessing',
              test: /node_modules[\\/](postprocessing|@react-three[\\/]postprocessing)[\\/]/,
              priority: 15,
            },
            {
              name: 'gsap',
              test: /node_modules[\\/]gsap[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
