<template>
  <div>
    <nuxt-link :to="`/users/${message.owner.login}`" class="block flex flex-wrap items-center"
         :class="{'text-right': authenticatedId === message.owner.id}"
         v-if="!previous_message || previous_message.owner.id !== message.owner.id">
      <avatar class="z-50 h-8 w-8"
              :class="{'order-2 ml-2': authenticatedId === message.owner.id}"
              :image-url="message.owner.avatar"/>
      <p class="flex-1 font-bold leading-3"
        :class="{'ml-2': authenticatedId !== message.owner.id}">
        {{message.owner.display_name}}
        <br>
        <span class="font-thin text-xs">
          <client-only>
            <timeago :datetime="message.created_at">{{ message.created_at }}</timeago>
          </client-only>
        </span>
      </p>
    </nuxt-link>
    <div class="w-full text-md leading-5"
        :class="{'pl-10': authenticatedId !== message.owner.id,
                  'pr-10 text-right': authenticatedId === message.owner.id}">
      {{ message.text }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {MessageInterface} from "~/utils/interfaces/chat/message.interface";
import Avatar from "~/components/User/Profile/Avatar.vue";

@Component({
  components: {
    Avatar
  }
})
export default class ChatMessage extends Vue {

  /** Properties */
  @Prop({required: true}) message!: MessageInterface
  @Prop({required: false}) previous_message?: MessageInterface

  /** Computed */
  get authenticatedId(): number {
    if (!this.$auth || !this.$auth.user)
      return -1
    else
      return (this.$auth.user as any).id
  }

}
</script>

<style scoped>

</style>
