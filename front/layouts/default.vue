<template>
  <div>
    <Navigation />
    <Sidebar />
    <client-only>
      <chat />
    </client-only>
    <div class="application bg-gray min-h-screen text-cream">
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Navigation from "~/components/Navigation.vue";
import Sidebar from "~/components/Sidebar.vue";
import Chat from "~/components/Chat/Chat.vue";

export default Vue.extend({
  components: {
    Navigation,
    Sidebar,
    Chat,
  },
})
</script>

<style>
html {
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.application {
  padding-left: 72px;
  padding-top: 72px;
}

</style>
