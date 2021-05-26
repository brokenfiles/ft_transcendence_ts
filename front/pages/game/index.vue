<template>
  <div>
    Game !!!
    <ball/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Ball from "~/components/Game/Pong/Ball.vue";

export default Vue.extend({
  name: "index",

  components:{
    Ball
  }
})
</script>

<style scoped>

</style>
