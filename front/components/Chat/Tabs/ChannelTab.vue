<template>
  <div>
    <div v-if="curr_channel">
      <back-button @back="goBack">Back to channels</back-button>
      <p class="text-right">
        <span class="text-gray-500 text-sm">
          Created
          <client-only>
            <timeago :datetime="curr_channel.created_at">{{ curr_channel.created_at }}</timeago>
          </client-only>
        </span>
        {{ curr_channel.name }}
      </p>
      <hr class="mt-1">
      <div class="messages my-4">
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

@Component({
  components: {
    ChatMessage,
    BackButton
  }
})
export default class ChannelTab extends Vue {

  /** Models */
  model_message: string = ''

  /** Variables */
  messages: MessageInterface[] = []

  /** Properties */
  @Prop({required: true}) curr_channel!: ChannelInterface

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
      })
      this.model_message = ''
    }
  }

  goBack() {
    this.messages = []
    this.$emit('back')
  }

  /** Socket listeners */
  @Socket('SendMessagesToClient')
  getMessage(messages: MessageInterface[] | null) {
    if (messages !== null) {
      this.messages = messages
    } else {
      this.$toast.error(`The password is wrong`)
      this.goBack()
    }
  }

  @Socket('SendLastMessagesToClient')
  addMessage(message: MessageInterface) {
    this.messages.push(message)
  }

}
</script>

<style scoped>

</style>
