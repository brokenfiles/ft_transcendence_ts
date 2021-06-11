<template>
  <div>
    <div class="bg-cream text-primary flex items-center px-4 py-2">
      <avatar class="w-10 h-10" :image-url="requester.avatar"/>
      <nuxt-link :to="`/users/${requester.login}`" class="ml-2 flex-1">
        {{ requester.display_name }} <br/>
        <span class="text-sm font-semibold">
            {{ requester.login }}
          </span>
      </nuxt-link>
      <div v-if="canAccept">
        <button @click="acceptRequest" class="bg-green-200 text-green-800 py-2 px-4 mr-2">Accept</button>
        <button @click="denyRequest" class="bg-red-200 text-red-800 py-2 px-4">Deny</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {UserInterface} from "~/utils/interfaces/users/user.interface";
import Avatar from "~/components/User/Profile/Avatar.vue";

@Component({
  components: {
    Avatar
  }
})
export default class GuildRequest extends Vue {

  @Prop({required: true}) requester!: UserInterface
  @Prop({default: false}) canAccept!: boolean

  /**
   * Accept the request
   * So add the user to guild
   * by emitting event
   */
  acceptRequest() {
    this.$emit('accepted', this.requester)
  }

  /**
   * Accept the request
   * So cancel the guild request
   * by emitting event
   */
  denyRequest() {
    this.$emit('denied', this.requester)
  }

}
</script>

<style scoped>

</style>
