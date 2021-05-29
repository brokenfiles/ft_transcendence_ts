<template>
<div class="fixed popup flex justify-center text-center items-center">
  <form @submit.prevent="fakeConnect">
    <div class="flex flex-col">
      <h1 class="inline text-black m-4 text-yellow" >Guest Name</h1>
      <input v-model="username" placeholder="guest-username" style="max-width: 15vw" class="text-center text-black">
      <p @click="fakeConnect" class=" p-2 pl-4 pr-4 m-4 text-black bg-yellow">Connect</p>
    </div>
  </form>
</div>
</template>

<script lang="ts">

import {Component, Vue} from "nuxt-property-decorator";

@Component({  })
export default class FakeConnectPopUp extends Vue {

  username: string = ''

  fakeConnect()
    {
      this.$auth.loginWith("local", {data:
          { guest_name: this.username }
      }).then(() => {
        if (this.$socket.connected)
          this.$socket.client.disconnect()
        this.$root.$emit('beforeWsConnect')
        this.$socket.client.connect()
        this.$toast.success(`Logged in as ${this.$auth.user.login}`)
      }).catch((error) => {
        console.log(error)
        this.$toast.error(`Error when trying to login to 42`)
      })
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
  @apply text-cream;
}

</style>
