import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
        ws: require.resolve('ws'),
    },
  },
});
