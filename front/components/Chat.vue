<template>
  <div class="fixed bottom-0 right-0 bg-red-500 mr-10 bg-primary text-cream" :class="{'closed': !chatOpen, 'open': chatOpen}" id="chat-rooms">
    <div class="flex py-2 px-32 items-center cursor-pointer w-full" @click="chatOpen = !chatOpen" id="chat-header">
      <h2 class="text-white flex-1 font-semibold">Channels</h2>
      <svg id="chatroom-icon" class="mx-2 h-5 w-5 transition duration-150 ease-in-out" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="overflow-y-hidden" id="chat-body">
      <div class="overflow-y-auto px-4" id="chat-body-2">
        <form @submit.prevent="createChannel" class="flex mb-2">
          <input v-model="channelCreate" class="flex-1 focus:outline-none p-2 bg-secondary border border-cream" type="text" placeholder="Create channel...">
          <button type="submit" class="text-cream ml-2 bg-secondary border border-cream p-2 focus:outline-none">
            Create
          </button>
        </form>
        <channel v-for="(channel, index) in channels" class="my-2" :key="`channel-${index}`" @click="pickChannel(index)" :name="channel"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Channel from "~/components/Chat/Channel.vue";

export default Vue.extend({
  name: "Chat",

  components: {
    Channel,
  },

  data() {
    return {
      messages: [],
      channels: [],
      currentMessage: '',
      channelCreate: '',
      chatOpen: false
    }
  },

  sockets: {

    connect() {
      this.open = true
    },

    msgToClient(message: string) {
      this.messages.push(message)
    },

    channels(channels: string[]) {
      this.channels = channels
    }

  },

  mounted() {
    this.$socket.emit('getChannels')
  },

  methods: {
    sendMessage() {
      this.$socket.emit('msgToServer', this.currentMessage)
    },

    createChannel() {
      if (this.channelCreate.length > 3) {
        this.$socket.emit('createChannel', this.channelCreate)
        this.channelCreate = ''
      }
    },

    pickChannel(channelIndex: number) {
      this.$socket.emit('changedChanel', this.channels[channelIndex])
    }

  }
})
</script>

<style scoped>

#chat-rooms {
  transition: all 0.3s ease-in-out;
}

#chatroom-icon {
  transition: transform 0.3s ease-in-out;
}

#chat-body {
  transition: height 0.3s ease-in-out;
}

.closed #chatroom-icon {
  transform: rotate(180deg);
}

.closed #chat-body {
  height: 0;
}

.open #chatroom-icon {
  transform: rotate(0deg);
}

.open #chat-body {
  height: 50vh;
}

.open #chat-body-2 {
  height: 50vh;
}

</style>
