<template>
  <button @click="updateStatus" class="px-10 py-3 text-center uppercase font-bold rounded-md focus:outline-none" :class="classes">
    <span v-if="friendState === 0">
      Request friend
    </span>
    <span v-else-if="friendState === 1">
      Request sent
    </span>
    <span v-else-if="friendState === 2">
      Accept request
    </span>
    <span v-else-if="friendState === 3">
      Best friends
    </span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {FriendState} from "~/utils/enums/friend-state.enum";

/**
 * Ce component permet d'ajouter / supprimer un ami
 */
@Component({

})
export default class FriendButton extends Vue {

  @Prop({required: true}) friendState!: FriendState

  updateStatus() {
    this.$emit('update', this.friendState)
  }

  get classes() {
    if (this.friendState === FriendState.FRIEND) {
      return "bg-friend-200 text-friend-500"
    } else {
      return "bg-notFriend-200 text-notFriend-500"
    }
  }

}
</script>

<style scoped>

</style>
