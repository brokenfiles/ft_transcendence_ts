<template>
  <div id="search-bar" class="md:max-w-md max-w-0 px-4 py-2 md:border border-0 rounded flex items-center border-cream relative">
    <div class="search-icon">
      <font-awesome-icon :icon="['fas', 'search']"></font-awesome-icon>
    </div>
    <input type="text" v-model="search" @focus="focusBar = true" @blur="unFocus" class="flex-1 md:inline-block hidden border-none bg-transparent outline-none mx-4 placeholder-cream" placeholder="Search...">
    <div v-show="search.length >= 3 && results.length > 0 && focusBar" class="absolute w-full top-full left-0 right-0 bg-white text-primary">
      <nuxt-link v-for="(user, index) in results" :key="`result-${index}`"
                 :to="`/users/${user.login}`" class="block p-2 flex flex-wrap items-center hover:bg-gray-200">
        <avatar class="w-10 h-10" :image-url="user.avatar"/>
        <p class="ml-2">
          {{ user.display_name }} <br/>
          <span class="text-sm font-semibold">
            {{ user.login }}
          </span>
        </p>
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Watch} from 'nuxt-property-decorator'
import {UserInterface} from "~/utils/interfaces/users/user.interface";
import Avatar from "~/components/User/Profile/Avatar.vue";
import {Debounce} from "vue-debounce-decorator";


@Component({
  components: {
    Avatar
  },

})
export default class SearchBar extends Vue {

  search: string = ""
  results: UserInterface[] = []
  focusBar: boolean = false

  @Watch('search')
  @Debounce(500)
  async fetchInput() {
    if (this.search.length >= 3) {
      this.results = await this.$axios.$get(`/users/search?input=${this.search}`, {
        progress: false
      })
    }
  }

  unFocus() {
    setTimeout(() => this.focusBar = false, 100)
  }

}
</script>

<style scoped>

</style>
