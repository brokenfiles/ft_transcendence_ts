<template>
  <div>
    <Navigation />
    <Sidebar />
    <div class="application">
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Navigation from "~/components/Navigation.vue";
import Sidebar from "~/components/Sidebar.vue";

export default Vue.extend({
  components: {
    Navigation,
    Sidebar,
  }
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
