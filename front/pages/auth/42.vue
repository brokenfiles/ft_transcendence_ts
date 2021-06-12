<template>
  <div class="flex justify-center items-center text-center flex-col" id="loading-container">
    <svg class="animate-spin h-20 w-20 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p class="mt-4 font-semibold">Loading...</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {mapGetters} from "vuex";

export default Vue.extend({
  mounted() {
    const code = this.$route.query.code
    if (code !== '') {
      this.$auth.loginWith('local', {
        data : {
          code
        }
      }).then(() => {
        // reconnect the client if he is connected / connect if he is not connected
        if (this.$socket.connected)
          this.$socket.client.disconnect()
        this.$root.$emit('beforeWsConnect')
        this.$socket.client.connect()
        this.$toast.success(`Logged in as ${this.loggedInUser.login}`)
      }).catch((error) => {
        console.log(error)
        this.$toast.error(error.response.data.error)
        this.$router.push('/')
      })
    }
  },

  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
  }
})
</script>

<style scoped>
#loading-container {
  height: 80vh;
}
</style>
