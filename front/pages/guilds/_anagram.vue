<template>
  <div>
    {{guild}}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'
import {GuildInterface} from "~/utils/interfaces/guilds/guild.interface";

@Component({})
export default class SingleGuild extends Vue {

  guild: GuildInterface = null

  validate({params}) {
    const anagram = params.anagram
    return (anagram !== 'mine' && anagram.length >= 3 && anagram.length <= 5)
  }

  async asyncData({app, params}) {
    const guild = await app.$axios.$get(`guilds?anagram=${params.anagram}`)
      .catch(() => {
        error({
          statusCode: 404,
          message: 'This guild does not exist'
        })
      })
    return {guild}
  }

}
</script>

<style scoped>

</style>
