<template>
  <div class="min-h-screen">
    <h1 class="text-center md:text-8xl text-2xl font-bold md:px-32 px-2 pt-16 text-cream">
      ft_transcendence a beautiful <span class="text-yellow">pong game</span>
    </h1>
    <button class="mx-auto flex items-center mt-8 px-8 py-2 text-primary bg-yellow font-semibold text-xl" id="play-now">
      <span class="flex-1 mx-4">play now</span>
      <font-awesome-icon :icon="['fas', 'play']"></font-awesome-icon>
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'index',
})
</script>

<style scoped>

</style>
