<template>
  <div class="w-full md:w-96 fixed bottom-0 right-0 bg-red-500 md:mr-10 bg-primary text-cream z-40"
       :class="{'closed': !isChatOpen, 'open': isChatOpen}" id="chat-rooms">
    <div class="flex py-2 px-4 md:px-32 items-center cursor-pointer w-full md:justify-center" @click="isChatOpen = !isChatOpen"
         id="chat-header">
      <h2 class="text-white flex-1 md:flex-none font-semibold">Chat</h2>
      <svg id="chatroom-icon" class="mx-2 h-5 w-5 transition duration-150 ease-in-out"
           xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"/>
      </svg>
    </div>
    <div class="overflow-y-hidden chat-body">
      <div class="overflow-y-auto chat-body" ref="chatBody">

        <div v-show="curr_channel === null">
          <home-tab class="px-4" @channelChanged="changeCurrChannel" :channels="channels"/>
        </div>

        <div v-show="curr_channel !== null && admin_mode === false">
          <channel-tab @back="closedChannel" @adminPanelOpened="admin_mode = true"
                       :messages="sortedMessages" :curr_channel="curr_channel" :open="isChatOpen"/>
        </div>

        <div v-if="admin_mode === true && curr_channel">
          <admin-tab class="px-4" @channelSaved="channelSaved" @back="admin_mode = false" :current_channel="curr_channel"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Channel from "~/components/Chat/Channel.vue";
import {Socket} from "vue-socket.io-extended";
import {Component} from "nuxt-property-decorator";
import HomeTab from "~/components/Chat/Tabs/HomeTab.vue";
import ChannelTab from "~/components/Chat/Tabs/ChannelTab.vue";
import {ChannelInterface} from "~/utils/interfaces/chat/channel.interface";
import AdminTab from "~/components/Chat/Tabs/AdminTab.vue";
import {MessageInterface} from "~/utils/interfaces/chat/message.interface";
import {NotifyOptions} from "~/utils/interfaces/notifications/notify.options.interface";

interface NotificationOptions {
  message: string
  type: string
}

@Component({
  components: {
    Channel,
    HomeTab,
    ChannelTab,
    AdminTab
  }
})
export default class Chat extends Vue {

  /** Variables */
  channels: ChannelInterface[] = []
  messages: MessageInterface[] = []
  page: number = 0
  curr_channel: any = null
  admin_mode: boolean = false
  isChatOpen: boolean = false

  @Socket('getChannels')
  getChannel(channels: ChannelInterface[]) {
    this.channels = channels
  }

  async mounted() {
    if (this.$auth.loggedIn) {
      await this.$auth.fetchUser()
      await this.$socket.client.emit('getChannels')
      this.$root.$on('receivedMessage', this.scrollToBottom)
      this.$root.$on('scrollToBottom', () => this.scrollToBottom(true))
      const $refs = this.$refs as any
      const element = $refs.chatBody as HTMLElement
      if (element) {
        element.addEventListener('scroll', () => this.scrollEvent(element))
      }
    }
  }

  beforeDestroy () {
    const $refs = this.$refs as any
    const element = $refs.chatBody as HTMLElement
    if (element) {
      element.removeEventListener('scroll', () => this.scrollEvent(element))
    }
  }

  scrollEvent (element: HTMLElement) {
    if (element.scrollTop <= 20 && this.page !== -1 && this.curr_channel) {
      this.$socket.client.emit(`getLazyMessages`, {
        channel_id: this.curr_channel.id,
        password: this.curr_channel.password,
        page: this.page
      }, (data: any) => {
        if (data.messages && data.messages.length > 0) {
          for (const message of data.messages) {
            this.messages.push(message)
          }
          this.page ++
        } else {
          this.page = -1
        }
      })
    }
  }

  channelSaved(channel: ChannelInterface, stopAdmin: boolean = true) {
    if (stopAdmin)
      this.admin_mode = false
    this.curr_channel = channel
  }

  changeCurrChannel(channel: ChannelInterface) {
    this.page = 0
    this.$socket.client.emit('channelChanged', {
      channel_id: channel.id,
      password: channel.password,
      page: this.page
    }, (data: any) => {
      if (data.error) {
        this.$toast.error(data.error)
        if (process.client && localStorage.getItem(`channel-password-${channel.id}`))
          localStorage.removeItem(`channel-password-${channel.id}`)
      } else {
        if (data.messages) {
          this.curr_channel = channel
          this.messages = data.messages
          this.page ++
          this.scrollToBottom(true)
          if (channel.password && process.client) {
            localStorage.setItem(`channel-password-${channel.id}`, channel.password)
          }
        }
      }
    })
  }

  closedChannel(): void {
    this.curr_channel = null
    this.$socket.client.emit('channelChanged', {
      channel_id: -1
    }, () => {
      this.messages = []
    })
  }

  scrollToBottom(firstTime: boolean = false): void {
    const refs = (this.$refs as any)
    if (refs.chatBody) {
      let element = refs.chatBody as HTMLElement
      this.$nextTick(() => {
        const scrollTop = element.scrollTop + element.offsetHeight
        if (scrollTop + 200 >= element.scrollHeight || firstTime) {
          element.scrollTop = element.scrollHeight
        }
      })
    }
  }

  @Socket('SendLastMessagesToClient')
  addMessage(message: MessageInterface) {
    this.messages.push(message)
    this.scrollToBottom()
  }

  @Socket("goBackToHome")
  goBackToHomeEvent(notify: NotificationOptions) {
    this.$toast.show(notify.message, {
      type: notify.type
    })
    this.curr_channel = null
    this.admin_mode = false
  }

  get sortedMessages () : MessageInterface[] {
    return this.messages.sort((a, b) => new Date(a.created_at) > new Date(b.created_at) ? 1 : -1)
  }

}

</script>

<style scoped>

#chat-rooms {
  transition: all 0.3s ease-in-out;
}

#chatroom-icon {
  transition: transform 0.3s ease-in-out;
}

.chat-body {
  transition: height 0.3s ease-in-out;
}

.closed #chatroom-icon {
  transform: rotate(180deg);
}

.closed .chat-body {
  height: 0;
}

.open #chatroom-icon {
  transform: rotate(0deg);
}

.open .chat-body {
  height: 50vh;
}

@media screen and (max-width: 768px) {
  .open .chat-body {
    height: 70vh;
  }

}

</style>
