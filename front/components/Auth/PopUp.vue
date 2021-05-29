<template>
<div class="fixed popup flex justify-center text-center items-center">
  <form @submit.prevent="fakeConnect">
    <div class="flex flex-col">
      <h1 class="inline text-black m-4" style="color: #FFDA18;">Guest Name</h1>
      <input v-model="username" placeholder="guest-username" style="max-width: 15vw" class="text-center text-black">
      <p @click="fakeConnect" class=" p-2 pl-4 pr-4 m-4 text-black" style="background-color: #FFDA18">Connect</p>
    </div>
  </form>
</div>
</template>

<script>

import {mapGetters} from "vuex";

export default {
  name: "PopUp",

  data() {
    return{
      username: ''
    }
  },

  methods: {
    fakeConnect()
    {
      this.$auth.loginWith("custom", {data:
          { pseudo: this.username }
      }).then(() => {
        if (this.$socket.connected)
          this.$socket.client.disconnect()
        this.$root.$emit('beforeWsConnect')
        this.$socket.client.connect()
        this.$toast.success(`Logged in as ${this.loggedInUser.login}`)
      }).catch((error) => {
        console.log(error)
        this.$toast.error(`Error when trying to login to 42`)
      })
    }
  },

  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
  }
}
</script>

<style scoped>

.popup
{
  width: 15vw;
  left: 50%;
  margin-left: -7.5vw;
  top: 25%;
  margin-top: -15vh;
  background-color: rgba(17, 25, 39, 0.5);
  color: #EEEBDE;
}

</style>
