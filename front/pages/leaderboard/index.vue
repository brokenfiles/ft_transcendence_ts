<template>
  <div>
    <h1 class="text-5xl mt-8 font-semibold flex-1 text-center text-yellow mb-4">Leaderboard</h1>
    <div class="flex w-full justify-center">
      <div class="w-1/3 py-2 px-1">
        <button
          @click="tab = 'users'"
          :class="getClasses('users')"
          class="block focus:outline-none w-full text-primary text-center py-4 rounded-tl-lg rounded-tr-lg">
          Users
        </button>
      </div>
      <div class="w-1/3 py-2 px-1">
        <button
          @click="tab = 'guilds'"
          :class="getClasses('guilds')"
          class="block focus:outline-none w-full text-primary text-center py-4 rounded-tl-lg rounded-tr-lg">
          Guilds
        </button>
      </div>
    </div>
    <div class="w-2/3 mx-auto pb-8">
      <div class="px-1">
        <div v-if="tab === 'users'">
          <div class="block flex items-center bg-cream text-primary px-4 py-2 mb-2"
               v-for="(user, index) in users" :key="`user-guild-${index}`">
            <leaderboard-rank :rank-number="index + 1" class="w-8 h-8 mr-4"/>
            <avatar class="h-12 w-12" :image-url="user.avatar"/>
            <nuxt-link :to="`/users/${user.login}`" class="ml-2 flex-1">
              {{ user.display_name }} <br/>
              <span class="text-sm font-semibold">
                      {{ user.login }}
                    </span>
            </nuxt-link>
            <p>{{ user.points }} points</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'
import {UserInterface} from "~/utils/interfaces/users/user.interface";
import Avatar from "~/components/User/Profile/Avatar.vue";
import LeaderboardRank from "~/components/Leaderboard/LeaderboardRank.vue";

@Component({
  components: {
    Avatar,
    LeaderboardRank,
  }
})
export default class Leaderboard extends Vue {

  /** Variables */
  tab: string = 'users'
  users: UserInterface[] = []

  /** Methods */

  async fetch() {
    this.users = await this.$axios.$get('/users?order=desc')
  }

  getClasses(tab: string): string[] {
    if (this.tab === tab)
      return ['bg-yellow shadow-tabSelected']
    return ['bg-cream']
  }
}
</script>

<style scoped>

</style>
