<template>
  <div>
    <h2 class="text-center text-2xl font-bold my-8">
      List of guilds
    </h2>
    <div class="flex flex-wrap">
      <guild v-for="(guild, index) in guilds" :key="`guild-${index}`"
             class="md:w-1/2 w-full p-2" :guild="guild"/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'
import Guild from "~/components/Guild/Guild.vue";
import {GuildInterface} from "~/utils/interfaces/guilds/guild.interface";

@Component({
  components: {
    Guild
  }
})
export default class Guilds extends Vue {

  guilds: GuildInterface[] = []

  async fetch() {
    this.guilds = await this.$axios.$get('guilds')
  }

}
</script>

<style scoped>

</style>
