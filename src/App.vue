<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  background-color: rgb(32, 32, 32);
  color: whitesmoke;
  font-family: 'Trebuchet MS', Arial;
}
.error-msg {
  color: rgb(180, 66, 66);
  font-size: 20px;
}
</style>
