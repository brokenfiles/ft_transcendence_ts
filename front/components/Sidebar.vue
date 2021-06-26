<template>
  <div id="sidebar" :class="{'extended': extended, 'closed': !extended}"
       class="fixed left-0 bottom-0 top-0 py-4 overflow-y-hidden whitespace-nowrap z-50 bg-primary text-cream">
    <ul class="sidebar-items">
      <li class="sidebar-item my-4">
        <div class="flex">
          <div class="item-img flex-shrink-0 text-4xl text-center">
            <font-awesome-icon :icon="['fas', 'play-circle']"></font-awesome-icon>
          </div>
          <div class="item-content pr-8 pl-4 font-semibold">
            <div class="item-link my-2 text-xl" @click="extended = false">
              <nuxt-link to="/queue">Join a queue</nuxt-link>
            </div>
            <div class="item-link my-2 text-xl" @click="extended = false">
              <nuxt-link to="/game/tv">
                Live games
                <span class="live"></span>
              </nuxt-link>
            </div>
            <div class="item-link my-2 text-xl" @click="extended = false">
              <nuxt-link to="/rules">See the rules</nuxt-link>
            </div>
          </div>
        </div>
      </li>
      <li class="sidebar-item my-4">
        <div class="flex">
          <div class="item-img flex-shrink-0 text-4xl text-center">
            <font-awesome-icon :icon="['fas', 'users']"></font-awesome-icon>
          </div>
          <div class="item-content pr-8 pl-4 font-semibold">
            <div class="item-link my-2 text-xl" @click="extended = false">
              <nuxt-link to="/guilds">Guilds</nuxt-link>
            </div>
            <div class="item-link my-2 text-xl" @click="extended = false">
              <nuxt-link to="/guilds/create">Create a guild</nuxt-link>
            </div>
            <div class="item-link my-2 text-xl" @click="extended = false" v-if="this.$auth.user && this.$auth.user.guild">
              <nuxt-link :to="`/guilds/${this.$auth.user.guild.anagram}`">My guild</nuxt-link>
            </div>
          </div>
        </div>
      </li>
      <li class="sidebar-item my-4">
        <div class="flex">
          <div class="item-img flex-shrink-0 text-4xl text-center">
            <font-awesome-icon :icon="['fas', 'star']"></font-awesome-icon>
          </div>
          <div class="item-content pr-8 pl-4 font-semibold">
            <div class="item-link my-2 text-xl" @click="extended = false">
              <nuxt-link to="/leaderboard">Leaderboard</nuxt-link>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "nuxt-property-decorator";

@Component({})
export default class Sidebar extends Vue {

  extended: boolean = false

  mounted() {
    this.$root.$on('toggleSidebar',  () => this.extended = !this.extended)
  }

}
</script>

<style scoped>
#sidebar {
  top: 72px;
  max-width: 72px;
  transition: all 0.3s ease;
}

.live {
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: #ff5037;
  @apply rounded-full
}

@media screen and (max-width: 768px) {

  #sidebar .item-content {
    max-height: 500px;
  }

  #sidebar.closed {
    @apply transform -translate-x-full;
  }

  #sidebar.extended {
    @apply w-screen max-w-full;
  }

}

.item-img {
  width: 72px;
  @apply text-yellow;
}

.item-content {
  transition: max-height 0.3s ease;
  max-height: 0;
}

@media screen and (min-width: 768px) {
  #sidebar:hover {
    max-width: 500px;
  }

  #sidebar:hover .item-content {
    max-height: 500px;
  }
}

</style>
