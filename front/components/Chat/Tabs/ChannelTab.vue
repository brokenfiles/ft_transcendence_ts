<template>
  <div>
    <div v-if="curr_channel" class="relative">
      <div class="absolute bg-primary z-50 w-full">
        <div class="items-stretch flex">
          <back-button @back="goBack" class="left-0 w-full">Back to channels</back-button>
          <button @click="$emit('adminPanelOpened')" v-if="isChannelAdmin" class="focus:outline-none text-cream">
            <font-awesome-icon class="mr-1" :icon="['fas', 'user-shield']"/>
  <!--          Admin dashboard-->
          </button>
        </div>
        <p class="text-center w-full" @mouseover="showChannelCreationDate = true" @mouseleave="showChannelCreationDate = false">
          <span class="text-gray-500 text-sm absolute bg-primary block" v-if="showChannelCreationDate === true">
            Created
            <client-only>
              <timeago :datetime="curr_channel.created_at">{{ curr_channel.created_at }}</timeago>
            </client-only>
          </span>
          {{ curr_channel.name }}
        </p>
        <hr class="mt-1">
      </div>
      <div class="messages pt-16">
        <div v-for="(message, index) in messages" :key="`message-${index}`" class="">
          <chat-message class="mb-1" :previous_message="index === 0 ? null : messages[index - 1]" :message="message"/>
        </div>
      </div>
      <div class="flex flex-col justify-end mb-4">
        <form @submit.prevent="sendMessage()" class="flex mt-2">
          <input v-model="model_message" class="flex-1 focus:outline-none p-2 bg-secondary border border-cream"
                 type="text" placeholder="Send message">
          <button type="submit" class="text-cream ml-2 bg-secondary border border-cream p-2 focus:outline-none">
            Send
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {Socket} from "vue-socket.io-extended";
import {MessageInterface} from "~/utils/interfaces/chat/message.interface";
import ChatMessage from "~/components/Chat/Tabs/Components/ChatMessage.vue";
import BackButton from "~/components/Chat/Tabs/Components/BackButton.vue";
import {ChannelInterface} from "~/utils/interfaces/chat/channel.interface";
import {Message} from "postcss";
import Popup from "~/components/Core/Popup.vue";

@Component({
  components: {
    ChatMessage,
    BackButton,
    Popup
  }
})
export default class ChannelTab extends Vue {

  /** Models */
  model_message: string = ''

  /** Variables */
  showChannelCreationDate: boolean = false

  /** Properties */
  @Prop({required: true}) curr_channel!: ChannelInterface
  @Prop({required: true}) messages!: MessageInterface[]

  /** Methods */

  /**
   * Send a message to the back
   */
  sendMessage() {
    if (this.model_message.length > 0) {
      this.$socket.client.emit('msgToServer', {
        channel_id: this.curr_channel.id,
        message: this.model_message,
        user_id: (this.$auth.user as any).id
      }, (data: any) => {
      	if (data.error)
			this.$toast.error(data.error)
	  })
      this.model_message = ''
    }
  }

  goBack() {
    this.$emit('back')
  }

  get isChannelAdmin(): boolean {
    return (this.$auth.user && this.curr_channel.administrators.map(u => u.id).includes(this.$auth.user.id))
  }

}
</script>

<style scoped>

</style>
