<template>
  <div class="flex justify-center items-center" id="login-container">
    <button class="bg-fortytwo text-white font-bold uppercase px-8 py-2 flex items-center" @click="login('fortytwo')">
      Login with
      <img src="42.png" class="h-10 ml-4" alt="42">
    </button>
    <p class="pl-4 pr-4"> or </p>
    <button class="bg-fortytwo text-white font-bold uppercase px-8 py-2 flex items-center" style="height: 56px" @click="ShowModal">
      Login with guest
<!--      <img src="42.png" class="h-10 ml-4" alt="42">-->
    </button>
    <fake-connect-pop-up v-if="this.GuestModal"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import FakeConnectPopUp from "~/components/Auth/PopUp.vue";
import {Component} from "nuxt-property-decorator";

@Component({
  name: "login",
  components: {FakeConnectPopUp},
  middleware: ['guest'],
})
export default class Login extends Vue {

  GuestModal: boolean = false

  login(strategy: string) {
    this.$auth.loginWith(strategy)
  }

  ShowModal()
  {
    this.GuestModal = !this.GuestModal
  }
}
</script>

<style scoped>
#login-container {
  height: 80vh;
}
</style>
