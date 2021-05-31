<template>
  <div>
    <h2 class="text-center text-2xl font-bold my-8">
      Create a guild
    </h2>
    <div class="bg-secondary text-cream p-4 w-full md:mx-auto md:w-2/3 w-full">
      <form action="#" @submit.prevent="createGuild">
        <div class="flex flex-wrap items-center w-full">
          <label for="guild_name">Guild name</label>
          <input id="guild_name" class="ml-auto w-1/3 bg-cream text-primary py-2 px-4 focus:outline-none" minlength="3" maxlength="16" v-model="guild_name" type="text">
        </div>
        <div class="flex flex-wrap items-center w-full mt-2">
          <label for="guild_anagram">Guild anagram</label>
          <input id="guild_anagram" class="ml-auto w-1/3 bg-cream text-primary py-2 px-4 focus:outline-none" minlength="3" maxlength="5" v-model="guild_anagram" type="text">
        </div>
        <div class="flex flex-wrap items-center w-full mt-2">
          <label for="guild_open">Is guild open ?</label>
          <input id="guild_open" class="ml-auto w-1/3 bg-cream text-primary p-2 focus:outline-none" v-model="guild_open" type="checkbox">
        </div>
        <button type="submit" class="bg-yellow text-primary px-4 py-2 mt-4 w-full focus:outline-none">Create</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'

@Component({
  middleware: ['auth']
})
export default class CreateGuild extends Vue {

  guild_name: string = ''
  guild_anagram: string = ''
  guild_open: boolean = false

  createGuild () {
    this.$axios.post('guilds', {
      name: this.guild_name,
      anagram: this.guild_anagram,
      open: this.guild_open
    }).then(() => {
      this.$toast.success(`Guild ${this.guild_name} created`)
      this.$auth.fetchUser()
      this.$router.push(`/guilds/${this.guild_anagram}`)
    }).catch((error) => {
      this.$toast.error(error.response.data.message[0], {
        duration: 8000
      })
    })
  }

}
</script>

<style scoped>

</style>
