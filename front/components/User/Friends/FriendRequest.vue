<template>
  <div class="text-center">
    <nuxt-link tag="a" :to="`/users/${friendRequest.requester.login}`"
               class="bg-secondary py-8 px-2 flex flex-col items-center justify-center">
      <avatar class="h-20 w-20" :image-url="friendRequest.requester.avatar"/>
      <h2 class="font-semibold mt-2 text-xl">
        {{ friendRequest.requester.display_name }}
      </h2>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {FriendRequestInterface} from "~/utils/interfaces/users/requests/friend.request.interface";
import Avatar from "~/components/User/Profile/Avatar.vue";

@Component({
  components: {
    Avatar
  }
})
export default class FriendRequest extends Vue {

  @Prop({required: true}) friendRequest!: FriendRequestInterface

}
</script>

<style scoped>

</style>
