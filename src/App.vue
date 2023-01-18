<template>
  <div id="app">
    <ImageViewer src_dir="~/Desktop/hangji"/>
  </div>
</template>

<script>
import ImageViewer from './components/ImageViewer.vue'

export default {
  name: 'App',
  components: {
    ImageViewer,
  }
}
</script>

<style>
/* 必须指定html和body的height，否则不占满整个网页，真草啊 */
html, body, #app {
  height: 100%; 
  width: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  display: flex;
}
</style>
