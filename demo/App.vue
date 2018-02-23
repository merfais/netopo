<template>
  <div id="app">
    <graph/>
  </div>
</template>

<script>
  import Graph from './Netopo.vue'

  export default {
    name: 'app',
    components: {
      Graph,
    }
  };
</script>

<style scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 60px;
}
</style>
