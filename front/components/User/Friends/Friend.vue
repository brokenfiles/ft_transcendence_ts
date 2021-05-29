<template>
  <div class="text-center">
    <nuxt-link :to="`/users/${friend.login}`"
               class="bg-secondary py-8 px-2 flex flex-col items-center justify-center">
      <avatar class="h-20 w-20" :image-url="friend.avatar">
        <user-online-icon class="absolute h-5 w-5 top-0 right-0" :is-online="isOnline"/>
      </avatar>
      <h2 class="font-semibold mt-2 text-xl">
        {{ friend.display_name }}
      </h2>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {UserInterface} from "~/utils/interfaces/users/user.interface";
import Avatar from "~/components/User/Profile/Avatar.vue";
import UserOnlineIcon from "~/components/User/Profile/UserOnlineIcon.vue";

@Component({
  components: {
    Avatar,
    UserOnlineIcon
  }
})
export default class FriendComponent extends Vue {

  @Prop({required: true}) friend!: UserInterface
  @Prop({required: false, default: false}) isOnline!: boolean

}
</script>

<style scoped>

</style>
