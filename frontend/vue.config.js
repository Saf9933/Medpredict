const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5032', 
        changeOrigin: true,
      },
    },
  },
})
