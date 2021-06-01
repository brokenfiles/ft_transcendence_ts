<template>
  <div class="w-full md:w-auto fixed bottom-0 right-0 bg-red-500 md:mr-10 bg-primary text-cream z-40" :class="{'closed': !isChatOpen, 'open': isChatOpen}" id="chat-rooms" v-if="this.$auth.loggedIn">
    <div class="flex py-2 px-4 md:px-32 items-center cursor-pointer w-full" @click="isChatOpen = !isChatOpen" id="chat-header">
      <h2 class="text-white flex-1 font-semibold">Chat</h2>
      <svg id="chatroom-icon" class="mx-2 h-5 w-5 transition duration-150 ease-in-out" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="overflow-y-hidden chat-body">
      <div class="overflow-y-auto px-4 chat-body">

        <div v-if="curr_channel === ''">
          <form @submit.prevent="createChannel" class="flex mb-2">
            <input v-model="channel" class="flex-1 focus:outline-none p-2 bg-secondary border border-cream" type="text" placeholder="Create channel...">
            <button type="submit" class="text-cream ml-2 bg-secondary border border-cream p-2 focus:outline-none">
              Create
            </button>
          </form>
<!--          <channel v-for="(channel, index) in channels" class="my-2" :key="`channel-${index}`" @click="pickChannel(index)" :name="channel"/>-->
        </div>

<!--        <div v-else-if="picked.channel !== null">-->
<!--          <button class="text-yellow flex flex-wrap items-center focus:outline-none" @click="picked.channel = null">-->
<!--            <svg class="mx-2 h-5 w-5 transform rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">-->
<!--              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />-->
<!--            </svg>-->
<!--            Back to channels-->
<!--          </button>-->
<!--          <p class="text-right">{{ picked.channel }}</p>-->
<!--          <div class="flex flex-col justify-end">-->
<!--            <form @submit.prevent="sendMessage()" class="flex mt-2">-->
<!--              <input v-model="models.message" class="flex-1 focus:outline-none p-2 bg-secondary border border-cream" type="text" placeholder="Send message">-->
<!--              <button type="submit" class="text-cream ml-2 bg-secondary border border-cream p-2 focus:outline-none">-->
<!--                Send-->
<!--              </button>-->
<!--            </form>-->
<!--          </div>-->
<!--          <div class="messages">-->
<!--            <div v-for="(message, index) in messages" :key="`message-${index}`"  class="">-->
<!--              <p>{{ message }}</p>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Channel from "~/components/Chat/Channel.vue";
import {mapGetters} from "vuex";
// import {Socket} from "socket.io";
import {Socket} from "vue-socket.io-extended";
import {Component} from "nuxt-property-decorator";
import {Context} from "@nuxt/types";

@Component({
  components: {
    Channel,
  }
})
export default class Chat extends Vue {
      messages: string[] = []
      channels: string[] = []
      isChatOpen: boolean = false
      connected: boolean = false
      curr_channel: string = ""
      message: string = ''
      channel: string =  ''

  // sockets: {
  //
  //   connect() {
  //     this.$data.connected = true
  //     // this.$data.isChatOpen = true
  //   },
  //
  //   msgToClient(message: string) {
  //     // const audio = new Audio('sounds/message.mp3');
  //     // audio.play();
  //     this.$data.messages.push(message)
  //   },
  //
  //   channels(channels: string[]) {
  //     this.$data.channels = channels
  //   }
  // }

  mounted() {
        if (this.$auth.loggedIn)
          this.$auth.fetchUser()

    this.$socket
  }

    sendMessage() {
      this.$socket.client.emit('msgToServer', this.message)
    }

    createChannel() {
      if (this.channel.length > 3) {
        this.$socket.client.emit('createChannel', {
          name: this.channel,
          // user_id: this.$auth.user.id
        })
        // this.$axios.$post("chats/channels", {name: this.models.channel})
        this.channel = ''
      }
    }


    // pickChannel(channelIndex: number) {
    //   this.$socket.client.emit('changedChanel', this.channels[channelIndex])
    //   this.picked.channel = this.channels[channelIndex]
    //   this.messages = []
    // }

  // computed: {
  //   ...mapGetters(['isAuthenticated', 'loggedInUser'])
  // }

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
