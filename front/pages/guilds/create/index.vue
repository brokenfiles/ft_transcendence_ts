<template>
  <div>
    <h2 class="text-center text-2xl font-bold my-8">
      Create a guild
    </h2>
    <div class="bg-secondary text-cream p-4 md:mx-auto md:w-1/2 w-full">
      <form action="#" @submit.prevent="createGuild">
        <div class="flex">
          <div class="flex flex-wrap items-center w-full">
            <label for="guild_name" class="w-full">Guild name:</label>
            <input id="guild_name" class="rounded-md ml-0 w-2/3 bg-cream text-primary py-2 px-4 focus:outline-none" minlength="3" maxlength="16" v-model="guild_name" type="text">
          </div>
          <div class="flex flex-wrap items-center w-full mt-2">
            <label for="guild_anagram" class="w-full">Guild anagram:</label>
            <input id="guild_anagram" class="rounded-md ml-0 w-1/3 bg-cream text-primary py-2 px-4 focus:outline-none" minlength="3" maxlength="5" v-model="guild_anagram" type="text">
          </div>
        </div>
        <div class="flex flex-wrap items-center w-full mt-2">
          <label for="guild_anagram" class="w-full">Guild description:</label>
          <textarea id="guild_description" class="rounded-md ml-0 w-full bg-cream text-primary py-2 px-4 focus:outline-none" v-model="guild_description">
          </textarea>
        </div>
        <div class="flex flex-wrap items-center w-full mt-2">
          <label for="guild_open">State</label>
          <client-only>
            <toggle-button id="guild_open" v-model="guild_open" :value="guild_open" :labels="{checked: 'open', unchecked: 'closed'}"
                           @click="chooseGuildState" :width="63" class="ml-auto"/>
          </client-only>
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
  guild_description: string = ''
  guild_open: boolean = false

  createGuild () {
    this.$axios.post('guilds', {
      name: this.guild_name,
      anagram: this.guild_anagram,
      description: this.guild_description,
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

  chooseGuildState() {
    this.guild_open = !this.guild_open
  }

}
</script>

<style scoped>

</style>
