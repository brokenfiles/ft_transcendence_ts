<template>
  <div>
    <div class="flex justify-center items-center text-center flex-col" id="loading-container">
      <div v-if="double_auth_step === false">
        <svg class="animate-spin h-20 w-20 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 font-semibold">Loading...</p>
      </div>
      <div v-else>
        <p class="text-2xl mb-2">You received a mail with a code, please enter it</p>
        <form action="#" @submit.prevent="login">
          <input type="text" v-model="double_auth_code" placeholder="Your 2fa code" class="text-primary px-4 py-2 focus:outline-none">
          <button class="py-2 px-8 bg-yellow text-primary" type="submit">Validate</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "nuxt-property-decorator";

@Component({})
export default class AuthFortyTwo extends Vue {

  /** Variables */
  double_auth_step: boolean = false
  double_auth_code: string = ''

  /** Methods */
  mounted() {
    this.login()
  }

  /**
   * Login method (used to connect the 42 user to the back)
   */
  login () {
    const code = this.$route.query.code as string
    if (code !== '') {
      this.$auth.loginWith('local', {
        data : {
          code: !this.double_auth_step ? code : '-1',
          double_auth_code: this.double_auth_code
        }
      }).then(() => {
        // reconnect the client if he is connected / connect if he is not connected
        if (this.$socket.connected)
          this.$socket.client.disconnect()
        this.$root.$emit('beforeWsConnect')
        this.$socket.client.connect()
        this.$toast.success(`Logged in as ${this.$auth.user.login}`)
        this.$router.replace('/')
      }).catch((error) => {
        this.$toast.error(error.response.data.error)
        if (error.response.data.type === 'missing_2fa') {
          this.double_auth_step = true
        } else {
          this.$router.replace('/')
        }
      })
    } else {
      this.$toast.error(`No code provided by 42`)
      this.$router.push('/login')
    }
  }

}
</script>

<style scoped>
#loading-container {
  height: 80vh;
}
</style>
