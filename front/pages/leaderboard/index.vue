<template>
  <div>
    <h1 class="text-5xl mt-8 font-semibold text-center text-cream mb-4">Leaderboard</h1>
    <div class="flex w-full justify-center">
      <div class="w-1/2 md:w-1/3 py-2 px-1">
        <button
          @click="tab = 'users'"
          :class="getClasses('users')"
          class="block focus:outline-none w-full text-primary text-center py-4 rounded-tl-lg rounded-tr-lg">
          Users
        </button>
      </div>
      <div class="w-1/2 md:w-1/3 py-2 px-1">
        <button
          @click="tab = 'guilds'"
          :class="getClasses('guilds')"
          class="block focus:outline-none w-full text-primary text-center py-4 rounded-tl-lg rounded-tr-lg">
          Guilds
        </button>
      </div>
    </div>
    <div class="w-full md:w-2/3 mx-auto pb-8">
      <div class="px-1">
        <div v-if="tab === 'users'">
          <div :class="getUserBG(user.id)" class="block flex items-center text-primary px-4 py-2 mb-2"
               v-for="(user, index) in sortedUsers" :key="`user-guild-${index}`">
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
        <div v-if="tab === 'guilds'">
          <div :class="getGuildBG(guild.id)" class="block flex items-center text-primary px-4 py-2 mb-2"
               v-for="(guild, index) in sortedGuilds" :key="`user-guild-${index}`">
            <leaderboard-rank :rank-number="index + 1" class="w-8 h-8 mr-4"/>
            <span class="font-semibold">[{{ guild.anagram }}]</span>
            <nuxt-link :to="`/guilds/${guild.anagram}`" class="ml-2 flex-1 font-light">
              {{ guild.name }} <br/>
            </nuxt-link>
            <div class="mx-2 md:ml-0 md:mr-14">
              <span class="mr-2 hidden md:block">members :</span>
              <span class="font-light text-center block">{{ guild.users.length }}/{{guild.max_users}}</span>
            </div>
            <p>{{ guild.points }} points</p>
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
import {GuildInterface} from "~/utils/interfaces/guilds/guild.interface";

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
  guilds: GuildInterface[] = []

  /** Methods */
  async fetch() {
    this.users = await this.$axios.$get('/users?order=desc')
    this.guilds = await this.$axios.$get('/guilds?order=desc')
  }

  getClasses(tab: string): string[] {
    if (this.tab === tab)
      return ['bg-yellow shadow-tabSelected']
    return ['bg-cream']
  }

  getUserBG(userID: number): string[] {
    if (this.$auth.user && this.$auth.user.id === userID)
      return ['bg-green-200']
    return ['bg-cream']
  }

  getGuildBG(guildID: number): string[] {
    if (this.$auth.user && this.$auth.user.guild && this.$auth.user.guild.id === guildID)
      return ['bg-green-200']
    return ['bg-cream']
  }

  get sortedUsers () : UserInterface[] {
    return this.users.sort((a, b) => {
      return (a.points < b.points ? 1 : -1)
    })
  }

  get sortedGuilds () : GuildInterface[] {
    return this.guilds.sort((a, b) => {
      return (a.war_points < b.war_points ? 1 : -1)
    })
  }

}
</script>

<style scoped>

</style>
