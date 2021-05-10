<template>
  <div class="min-h-screen bg-gray">
    <h1 class="text-center text-8xl font-bold px-32 pt-16 text-cream">
      ft_transcendence a beautiful <span class="text-yellow">pong game</span>
    </h1>
    <button class="mx-auto flex items-center mt-8 px-8 py-2 text-primary bg-yellow font-semibold text-xl" id="play-now">
      <span class="flex-1 mx-4">play now</span>
      <font-awesome-icon :icon="['fas', 'play']"></font-awesome-icon>
    </button>
    <client-only>
      <chat />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Chat from "~/components/Chat.vue";

export default Vue.extend({
  name: 'index',

  components: {
    Chat
  },

  data() {
    return {
    }
  },

})
</script>

<style scoped>

</style>
