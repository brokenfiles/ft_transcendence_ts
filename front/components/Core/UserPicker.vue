<template>
  <div id="user-picker" class="relative block w-full focus:outline-none p-2 mb-2 flex items-center bg-secondary border border-cream">
    <div class="search-icon">
      <font-awesome-icon :icon="['fas', 'search']"></font-awesome-icon>
    </div>
    <input type="text" v-model="search" @focus="focusBar = true" @blur="unFocus"
           ref="searchInput"
           class="flex-1 md:w-full overflow-y-hidden border-none bg-transparent outline-none mx-4 placeholder-cream"
           placeholder="Add user...">
    <div v-show="search.length >= 3 && results.length > 0 && focusBar"
         class="absolute w-full top-full left-0 right-0 bg-white text-primary overflow-y-auto max-h-80 z-50">
      <div v-for="(user, index) in results" :key="`add-user-result-${index}`">
        <div v-if="!addedUsers.map(u => u.login).includes(user.login) && $auth.user.login !== user.login"
             class="block w-full p-2 flex flex-wrap items-center focus:outline-none">
          <avatar class="w-10 h-10" :image-url="user.avatar"/>
          <span class="ml-2 block flex-1">
            {{ user.display_name }} <br/>
            <span class="text-sm font-semibold text-left block">
              {{ user.login }}
            </span>
          </span>
          <button @click="addUser(user)" class="focus:outline-none p-2 bg-yellow text-primary">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop, Watch} from 'nuxt-property-decorator'
import {UserInterface} from "~/utils/interfaces/users/user.interface";
import {Debounce} from "~/utils/debounce/vue-debounce-decorator";
import Avatar from "~/components/User/Profile/Avatar.vue";

@Component({
  components: {
    Avatar
  },
})
export default class UserPicker extends Vue {

  @Prop({required: true}) addedUsers!: UserInterface[]

  search: string = ""
  results: UserInterface[] = []
  selectedResult: number = -1
  focusBar: boolean = false
  // cette variable correspond au mode téléphone
  extend: boolean = false

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
    setTimeout(() => this.focusBar = false, 150)
  }

  /**
   * Emit an event to the parent component
   * @param user
   */
  addUser(user: UserInterface) {
    this.$emit('pickedUser', user)
  }

}
</script>

<style scoped>

</style>
