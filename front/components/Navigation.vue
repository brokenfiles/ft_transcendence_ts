<template>
  <nav id="navbar" class="navbar fixed left-0 right-0 top-0 z-10 bg-secondary text-cream z-20">
    <ul class="flex flex-wrap items-center py-4 pr-4">
      <li class="nav-item navbar-brand w-10 h-10 font-bold mx-4 text-4xl text-center">
        <nuxt-link to="/">
          T
        </nuxt-link>
      </li>
      <li class="nav-item flex-1 ml-4">
        <div id="search-bar" class="max-w-md px-4 py-2 border-2 border rounded flex items-center border-cream">
          <div class="search-icon">
            <font-awesome-icon :icon="['fas', 'search']"></font-awesome-icon>
          </div>
          <input type="text" class="flex-1 border-none bg-transparent outline-none mx-4 placeholder-cream" placeholder="Search...">
        </div>
      </li>
      <li class="nav-item" v-if="!isAuthenticated">
        <nuxt-link to="login">
          <button class="py-2 px-8 bg-yellow text-primary">login or register</button>
        </nuxt-link>
      </li>
      <li class="nav-item" v-if="isAuthenticated">
        <button id="logout" @click="logout" class="py-2 px-8 bg-yellow text-primary">logout</button>
      </li>
      <li class="nav-item" v-if="isAuthenticated">
        <div class="profile flex flex-wrap items-center">
          <div class="profile-img">
            <img :src="loggedInUser.avatar" alt="Image de profile"
                 class="rounded-full w-10 h-10 mx-4">
          </div>
          <div class="dropdown">
            <button class="username flex flex-wrap items-center focus:outline-none" id="dropdown-button"
                    @click="toggleDropdown">
              <span>{{ loggedInUser.first_name }}</span>
              <svg id="dropdown-icon" :class="{'transform rotate-180': dropdown}" class="-mr-1 ml-2 h-5 w-5 transition duration-150 ease-in-out"
                   xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"/>
              </svg>
            </button>
            <div
              class="dropdown-items absolute text-right min-w-8 right-0 transition duration-150 ease-in-out focus:outline-none bg-primary text-cream"
              id="dropdown-menu" v-if="dropdown" tabindex="0">
              <nuxt-link to="#" class="dropdown-item block hover:bg-gray-600 pl-10 pr-4 py-2">
                My account
              </nuxt-link>
              <nuxt-link to="#" class="dropdown-item block hover:bg-gray-600 pl-10 pr-4 py-2">
                Settings
              </nuxt-link>
              <nuxt-link to="#" class="dropdown-item block hover:bg-gray-600 pl-10 pr-4 py-2">
                Friends
              </nuxt-link>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue'
import {mapGetters} from "vuex";

export default Vue.extend({
  name: "Navigation",

  data() {
    return {
      dropdown: false
    }
  },

  methods: {
    toggleDropdown() {
      this.dropdown = !this.dropdown
    },
    async logout() {
      await this.$auth.logout()
    }
  },

  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
  }
})
</script>

<style scoped>
</style>
