<template>
  <div class="flex justify-center items-center" id="login-container">
    <button class="bg-fortytwo text-white font-bold uppercase px-8 py-2 flex items-center" @click="login('fortytwo')">
      Login with
      <img src="42.png" class="h-10 ml-4" alt="42">
    </button>
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
  login(strategy: string) {
    this.$auth.loginWith(strategy)
  }
}
</script>

<style scoped>
#login-container {
  height: 80vh;
}
</style>
