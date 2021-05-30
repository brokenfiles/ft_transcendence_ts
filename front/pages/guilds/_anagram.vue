<template>
  <div>
    <div class="mt-8 px-4" v-if="guild">
      <div class="flex flex-wrap w-full items-center">
        <h1 class="text-4xl font-semibold flex-1">{{ guild.name }} [{{ guild.anagram }}]</h1>
        <div>
          <div v-if="$auth.loggedIn" class="inline-block">
            <button v-if="$auth.user.guild === null" class="bg-yellow text-primary py-2 px-4 rounded-md mr-2">
              <span v-if="guild.open">Join the guild</span>
              <span v-else>Request to join</span>
            </button>
            <button v-else-if="$auth.user.guild.id === guild.id"
                    class="bg-yellow text-primary py-2 px-4 rounded-md mr-2"
                    @click="leaveOrDestroyGuild">
              <span v-if="$auth.user.guild.id === guild.owner.id">Destroy guild</span>
              <span v-else>Leave guild</span>
            </button>
            <div v-else class="inline-block px-4">
              <span>Leave your guild to join</span>
            </div>
          </div>
          <div class="inline-block bg-cream text-primary py-2 px-4 rounded-md">
            <font-awesome-icon class="mr-4" :icon="['fas', 'trophy']"/>
            {{ guild.points }} points
          </div>
        </div>
      </div>
      <hr class="my-4">
      <div class="flex flex-wrap">
        <div class="w-full md:w-1/2 p-2">
          <!-- statistics -->
          <div class="text-primary">
            <div class="bg-cream flex px-4 py-2">
              <p class="flex-1 font-semibold">Created</p>
              <client-only>
                <p>
                  <timeago :datetime="guild.created_at">{{ guild.created_at }}</timeago>
                </p>
              </client-only>
            </div>
            <div class="bg-gray-300 flex px-4 py-2">
              <p class="flex-1 font-semibold">Guild points</p>
              <p>{{ guild.points }}</p>
            </div>
            <div class="bg-cream flex px-4 py-2">
              <p class="flex-1 font-semibold">War points</p>
              <p>{{ guild.war_points }}</p>
            </div>
            <div class="bg-gray-300 flex px-4 py-2">
              <p class="flex-1 font-semibold">Members</p>
              <p>{{ guild.users.length }}</p>
            </div>
            <div class="bg-cream flex px-4 py-2">
              <p class="flex-1 font-semibold">Owner</p>
              <p>
                <nuxt-link :to="`/users/${guild.owner.login}`">{{ guild.owner.display_name }} ({{
                    guild.owner.login
                  }})
                </nuxt-link>
              </p>
            </div>
            <div class="bg-gray-300 flex px-4 py-2">
              <p class="flex-1 font-semibold">Guild state</p>
              <p>{{ guild.open ? 'Open' : 'Closed' }}</p>
            </div>
          </div>
        </div>
        <div class="w-full md:w-1/2">
          <!-- historic -->
          <div class="flex">
            <div class="w-1/2 py-2 px-1">
              <button
                @click="tab = 'members'"
                :class="getClasses('members')"
                class="block focus:outline-none w-full text-primary text-center py-4 rounded-tl-lg rounded-tr-lg">
                Members
              </button>
            </div>
            <div class="w-1/2 py-2 px-1">
              <button
                @click="tab = 'wars'"
                :class="getClasses('wars')"
                class="block focus:outline-none w-full text-primary text-center py-4 rounded-tl-lg rounded-tr-lg">
                Wars
              </button>
            </div>
          </div>
          <div class="px-1">
            <div class="max-h-80 overflow-y-auto" v-if="tab === 'members'">
              <nuxt-link class="block flex items-center bg-cream text-primary px-4 py-2 my-2"
                         v-for="(user, index) in guild.users" :key="`user-guild-${index}`"
                         :to="`/users/${user.login}`">
                <avatar class="h-12 w-12" :image-url="user.avatar"/>
                <p class="ml-2 flex-1">
                  {{ user.display_name }} <br/>
                  <span class="text-sm font-semibold">
                    {{ user.login }}
                  </span>
                </p>
                <p>{{ user.points }} points</p>
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'
import {GuildInterface} from "~/utils/interfaces/guilds/guild.interface";
import {Context} from "@nuxt/types";
import Avatar from "~/components/User/Profile/Avatar.vue";
import {UserInterface} from "~/utils/interfaces/users/user.interface";

@Component({
  components: {
    Avatar
  }
})
export default class SingleGuild extends Vue {

  guild?: GuildInterface
  tab: string = 'members'

  validate({params}: Context) {
    const anagram = params.anagram
    return (anagram !== 'mine' && anagram.length >= 3 && anagram.length <= 5)
  }

  async asyncData({app, params, error}: Context) {
    const guild = await app.$axios.$get(`guilds?anagram=${params.anagram}`)
      .catch(() => {
        error({
          statusCode: 404,
          message: 'This guild does not exist'
        })
      })
    return {guild}
  }

  leaveOrDestroyGuild() {
    this.$axios.post('guilds/mine/leave')
      .then(() => {
        this.$toast.success(`You leaved your guild`)
      }).catch((error) => {
        this.$toast.error(error.response.data.message[0])
    })
  }

  getClasses(tab: string): string[] {
    if (this.tab === tab)
      return ['bg-yellow shadow-tabSelected']
    return ['bg-cream']
  }

  get guildUsers(): UserInterface[] | undefined {
    return this.guild?.users.sort()
  }

}
</script>

<style scoped>

</style>
