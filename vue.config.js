const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 产物输出到 dist/static，并以 /static/ 前缀引用，与 backend/file_server.py 的
  // template_folder/static_folder（../dist/static）保持一致
  outputDir: 'dist/static',
  publicPath: '/static/',
})
