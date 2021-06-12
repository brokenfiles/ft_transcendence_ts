<template>
  <div>
    <p class="text-right">{{ curr_channel }}</p>
    <hr class="mt-1">
    <div class="messages my-4">
      <div v-for="(message, index) in messages" :key="`message-${index}`"  class="">
        <chat-message class="mb-1" :previous_message="index === 0 ? null : messages[index - 1]" :message="message"/>
      </div>
    </div>
    <div class="flex flex-col justify-end mb-4">
      <form @submit.prevent="sendMessage()" class="flex mt-2">
        <input v-model="model_message" class="flex-1 focus:outline-none p-2 bg-secondary border border-cream" type="text" placeholder="Send message">
        <button type="submit" class="text-cream ml-2 bg-secondary border border-cream p-2 focus:outline-none">
          Send
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {Socket} from "vue-socket.io-extended";
import {MessageInterface} from "~/utils/interfaces/chat/message.interface";
import ChatMessage from "~/components/Chat/Tabs/Components/ChatMessage.vue";

@Component({
  components: {
    ChatMessage
  }
})
export default class ChannelTab extends Vue {

  /** Models */
  model_message: string = ''

  /** Variables */
  messages: MessageInterface[] = []

  /** Properties */
  @Prop({required: true}) curr_channel!: string

  /** Methods */

  /**
   * Send a message to the back
   */
  sendMessage() {
    if (this.model_message.length > 0) {
      this.$socket.client.emit('msgToServer', {
          channel: this.curr_channel,
          message: this.model_message,
          user_id: (this.$auth.user as any).id
        })
      this.model_message = ''
    }
  }

  /** Socket listeners */
  @Socket('SendMessagesToClient')
  getMessage(messages: MessageInterface[]) {
    this.messages = messages
  }

}
</script>

<style scoped>

</style>
