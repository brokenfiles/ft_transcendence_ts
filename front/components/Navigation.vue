<template>
  <nav id="navbar" class="navbar fixed left-0 right-0 top-0 z-10 bg-secondary text-cream z-20">
    <ul class="flex flex-wrap items-center py-4 pr-4">
      <li class="nav-item hidden md:inline-block navbar-brand w-10 h-10 font-bold mx-4 text-4xl text-center">
        <nuxt-link to="/">
          T
        </nuxt-link>
      </li>
      <li class="nav-item ml-4 inline-block md:hidden">
        <font-awesome-icon :icon="['fas', 'bars']"></font-awesome-icon>
      </li>
      <li class="nav-item flex-1 ml-4">
        <div id="search-bar" class="md:max-w-md max-w-0 px-4 py-2 md:border border-0 rounded flex items-center border-cream">
          <div class="search-icon">
            <font-awesome-icon :icon="['fas', 'search']"></font-awesome-icon>
          </div>
          <input type="text" class="flex-1 md:inline-block hidden border-none bg-transparent outline-none mx-4 placeholder-cream" placeholder="Search...">
        </div>
      </li>
      <li class="nav-item" v-if="!isAuthenticated">
        <nuxt-link to="login">
          <button class="py-2 px-8 bg-yellow text-primary">login or register</button>
        </nuxt-link>
      </li>
      <li class="nav-item hidden md:inline-block" v-if="isAuthenticated">
        <button id="logout" @click="logout" class="py-2 px-8 bg-yellow text-primary">logout</button>
      </li>
      <li class="nav-item" v-if="isAuthenticated">
        <div class="profile flex flex-wrap items-center">
          <div class="profile-img hidden md:inline-block">
            <avatar class="h-10 w-10 mx-4" :image-url="loggedInUser.avatar"/>
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
              id="dropdown-menu" ref="dropdown-menu" v-if="dropdown" tabindex="0">
              <nuxt-link :to="`/users/${this.loggedInUser.login}`" class="dropdown-item block hover:bg-gray-600 pl-10 pr-4 py-2">
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
import {Component, namespace} from "nuxt-property-decorator";
import Avatar from "~/components/User/Profile/Avatar.vue";

@Component({
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
  },

  components: {
    Avatar
  }
})
export default class Navigation extends Vue {

  dropdown: boolean = false

  toggleDropdown() {
    this.dropdown = !this.dropdown
  }

  async logout() {
    this.$socket.client.disconnect()
    await this.$auth.logout()
    this.$socket.client.connect()
    this.$toast.success(`Successfully logged out`)
  }

}
</script>

<style scoped>
</style>
