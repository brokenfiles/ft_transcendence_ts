<template>
  <div class="flex justify-center space-x-8 items-center" id="login-container">
    <button class="bg-fortytwo text-white font-bold uppercase px-8 py-2 flex items-center" @click="login('fortytwo')">
      Login with
      <img src="42.png" class="h-10 ml-4" alt="42">
    </button>
    <div class="cursor-pointer bg-fortytwo z-10 text-white font-bold uppercase px-8 py-2 flex items-center relative">
      <span class="h-10 leading-10 relative">
        Login as guest
      </span>
      <div class="absolute normal-case text-center top-full left-0 right-0 bg-secondary p-2">
        <p>Choose the name</p>
        <input v-model="name" type="text" class="w-full my-2 text-primary">
        <button class="bg-yellow text-primary w-full" @click="fakeLogin">Login</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "nuxt-property-decorator";

@Component({
  name: "login",

  middleware: ['guest']
})
export default class Login extends Vue {

  open: boolean = false
  name: string = ''

  login(strategy: string) {
    this.$auth.loginWith(strategy)
  }

  fakeLogin() {
    this.$auth.loginWith('fake', {
      params: {
        user: this.name
      }
    }).then(() => {
      // reconnect the client if he is connected / connect if he is not connected
      if (this.$socket.connected)
        this.$socket.client.disconnect()
      this.$root.$emit('beforeWsConnect')
      this.$socket.client.connect()
      this.$toast.success(`Logged in as ${(this.$auth.user as any).login}`)
    }).catch((error) => {
      console.log(error)
      this.$toast.error(`Error when trying to login to 42`)
      this.$router.push('/')
    })
  }
}
</script>

<style scoped>
#login-container {
  height: 80vh;
}
</style>
