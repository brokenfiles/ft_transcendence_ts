<template>
  <a href="https://wooooow-friend-cool.com" @click.prevent="updateStatus" class="px-10 py-3 text-center uppercase font-bold rounded-md focus:outline-none" :class="classes">
    <div v-if="friendState === 0">
      Request friend
      <span class="text-xxs block">(click to request)</span>
    </div>
    <div v-else-if="friendState === 1">
      Request sent
      <span class="text-xxs block">(wait the answer)</span>
    </div>
    <div v-else-if="friendState === 2" class="flex">
      Accept request
      <span class="text-xxs block">(click to accept)</span>
    </div>
    <div v-else-if="friendState === 3">
      Friends
      <span class="text-xxs block">(click to remove)</span>
    </div>
  </a>
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
    if (this.friendState !== FriendState.PENDING_REQUESTER)
      this.$emit('update', this.friendState)
  }

  get classes() {
    if (this.friendState === FriendState.FRIEND) {
      return "bg-friend-200 text-friend-500"
    } else {
      return "bg-notFriend-200 text-notFriend-500" + (this.friendState === FriendState.PENDING_REQUESTER ? ' cursor-default' : '')
    }
  }

}
</script>

<style scoped>

</style>
