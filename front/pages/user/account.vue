<template>
  <div class="flex flex-col items-center justify-center flex-wrap mt-12">
    <avatar class="h-24 w-24" :image-url="loggedInUser.avatar"/>
    <h1 class="font-semibold mt-2 text-2xl">
      <span v-if="guild">[{{guild.anagram}}]</span>
      {{ loggedInUser.display_name }}
    </h1>
    <div v-if="guild && guild.owner">
      <p>{{ guild.owner.id === loggedInUser.id ? 'Owner' : 'Officer' }} in {{ guild.name }}</p>
    </div>
    <level-bar class="mt-8" :points="loggedInUser.points"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Avatar from "~/components/User/Profile/Avatar.vue";
import {mapGetters} from "vuex";
import LevelBar from "~/components/User/Profile/LevelBar.vue";

export default Vue.extend({
  name: "account",

  components: {
    Avatar,
    LevelBar
  },

  middleware: ['auth'],

  data() {
    return {
      guild: null
    }
  },

  async fetch() {
    if (this.loggedInUser.guild)
      this.guild = await this.$axios.get(`/guilds/${this.loggedInUser.guild.id}`).then(result => result.data)
  },

  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser'])
  }
})
</script>

<style scoped>

</style>
