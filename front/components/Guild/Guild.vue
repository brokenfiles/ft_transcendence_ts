<template>
  <div>
    <div class="bg-secondary p-4 text-center">
      <nuxt-link :to="`/guilds/${guild.anagram}`">
        [{{ guild.anagram }}]
        <span class="font-semibold"> {{ guild.name }}</span>
      </nuxt-link>
      <p class="mt-2">
        <tag v-if="guild.open" class="bg-green-200 bg-green-800">Open</tag>
        <tag v-else class="bg-red-200 text-red-800">Closed</tag>
      </p>
      <div class="flex flex-wrap justify-around mt-4">
        <p class="bg-primary px-4">
          <span class="font-semibold">{{ numberOfUsers }} </span>
          users
        </p>
        <p class="bg-primary px-4">
          <span class="font-semibold">{{ guild.points }} </span>
          points
        </p>
        <p class="bg-primary px-4">
          ratio
          <span class="font-semibold">{{ 45 }} </span>
        </p>
      </div>
      <p class="mt-4">
        Owner :
        <nuxt-link class="text-yellow" :to="`/users/${ this.guild.owner.login }`">{{ this.guild.owner.display_name }}</nuxt-link>
      </p>
      <nuxt-link :to="`/guilds/${guild.anagram}`" class="bg-yellow text-primary mt-2 py-2 w-full block">
        <span>See guild details</span>
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {GuildInterface} from "~/utils/interfaces/guilds/guild.interface";
import Tag from "~/components/Core/Tag.vue";
import Popup from "~/components/Core/Popup.vue";

@Component({
  components: {
    Tag,
  }
})
export default class Guild extends Vue {

  @Prop({required: true}) guild!: GuildInterface

  /**
   * @returns {number} the number of users
   */
  get numberOfUsers() {
    return this.guild.users.length
  }

}
</script>

<style scoped>

</style>
