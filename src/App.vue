<template>
  <div id="app">
    <ImageViewer/>
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
* {
  box-sizing: border-box;
}

/* 必须指定html和body的height，否则不占满整个网页，真草啊 */
html, body, #app {
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
}
</style>
