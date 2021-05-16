<template>
  <div>
    partie authentifiée (displayname: {{loggedInUser.display_name}})
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {mapGetters} from "vuex";

export default Vue.extend({
  name: "verified",

  middleware: ['auth'],

  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  }
})
</script>

<style scoped>

</style>
