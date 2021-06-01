<template>
  <div id="search-bar" class="border md:max-w-md px-4 py-2 md:border rounded flex items-center border-cream relative">
    <div class="search-icon">
      <font-awesome-icon :icon="['fas', 'search']"></font-awesome-icon>
    </div>
    <input type="text" v-model="search" @focus="focusBar = true" @blur="unFocus"
           ref="searchInput"
           class="flex-1 md:w-full overflow-y-hidden border-none bg-transparent outline-none mx-4 placeholder-cream"
           placeholder="Search...">
    <div v-show="search.length >= 3 && results.length > 0 && focusBar"
         class="absolute w-full top-full left-0 right-0 bg-white text-primary overflow-y-auto max-h-80">
      <nuxt-link v-for="(user, index) in results" :key="`result-${index}`"
                 :to="`/users/${user.login}`" class="block p-2 flex flex-wrap items-center hover:bg-gray-200"
                 :class="{'bg-gray-200': selectedResult >= 0 && results[selectedResult] === user}">
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
import {Debounce} from "~/utils/debounce/vue-debounce-decorator";

/**
 * Ce composant a comme but de prendre un input, attendre un "debounce time" de 500ms
 * Et lorsque l'user a fini d'entrer l'input, de faire une requête pour trouver les users
 * Puis les afficher
 */
@Component({
  components: {
    Avatar
  },

})
export default class SearchBar extends Vue {

  search: string = ""
  results: UserInterface[] = []
  selectedResult: number = -1
  focusBar: boolean = false
  // cette variable correspond au mode téléphone
  extend: boolean = false

  mounted() {
    document.addEventListener('keydown', this.keyDownEvent)
  }

  beforeDestroy() {
    document.removeEventListener('keydown', this.keyDownEvent)
  }

  keyDownEvent(event: KeyboardEvent) {
    const key = event.key
    const searchElement = (this.$refs.searchInput as HTMLElement)
    if (event.ctrlKey && key === 'k') {
      searchElement.focus()
    }
    if (this.focusBar) {
      if (key === 'ArrowUp') {
        if (this.selectedResult <= 0)
          this.selectedResult = this.results.length - 1
        else
          this.selectedResult --
      } else if (key === 'ArrowDown') {
        if (this.selectedResult >= this.results.length - 1)
          this.selectedResult = 0
        else
          this.selectedResult ++
      } else if (key === 'Enter') {
        searchElement.blur()
        this.$router.push(`/users/${this.results[this.selectedResult].login}`)
      }
    }
  }

  @Watch('search')
  @Debounce(500)
  async fetchInput() {
    if (this.search.length >= 3) {
      this.results = await this.$axios.$get(`/users/search?input=${this.search}`, {
        progress: false
      })
      if (this.results.length > 0)
        this.selectedResult = 0
      else
        this.selectedResult = -1
    }
  }

  unFocus() {
    setTimeout(() => this.focusBar = false, 100)
  }

}
</script>

<style scoped>
#search-bar {
  height: 42px;
}
</style>
