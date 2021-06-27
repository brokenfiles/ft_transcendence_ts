<template>
  <div class="w-full">
    <nuxt-link :to="`/users/${message.owner.login}`" class="flex flex-wrap items-center mt-4"
         :class="{'text-right': authenticatedId === message.owner.id}"
         v-if="!previous_message || previous_message.owner.id !== message.owner.id">
      <div class="flex w-full items-center" :class="{'justify-end': authenticatedId === message.owner.id}">
        <p :class="userNameClasses" class="text-gray-400 text-xs font-light">{{ message.owner.display_name }}</p>
        <avatar class="z-40 h-8 w-8"
                :class="{'order-2 ml-2': authenticatedId === message.owner.id}"
                :image-url="message.owner.avatar"/>
        <button @click.prevent="duelUser" class="focus:outline-none ml-2 order-3" v-if="message.owner.id !== authenticatedId && isOwnerOnline">🏓</button>
      </div>
      <p class="flex-1"
        :class="{'ml-2': authenticatedId !== message.owner.id}">
      </p>
    </nuxt-link>
    <p :class="classes" @mouseover="showMessageSendingDate = true" @mouseleave="showMessageSendingDate = false" class="break-words max-w-xs">
      {{ message.text }}
    </p>
    <span :class="messageDateClasses" class="text-gray-500 text-sm absolute bg-primary block z-50 -mt-6 rounded-md px-2" v-if="showMessageSendingDate">
      <client-only>
        <timeago :datetime="message.created_at">{{ message.created_at }}</timeago>
      </client-only>
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, namespace, Prop} from 'nuxt-property-decorator'
import {MessageInterface} from "~/utils/interfaces/chat/message.interface";
import Avatar from "~/components/User/Profile/Avatar.vue";

const onlineClients = namespace('onlineClients')

@Component({
  components: {
    Avatar
  }
})
export default class ChatMessage extends Vue {

  /** Properties */
  @Prop({required: true}) message!: MessageInterface
  @Prop({required: false}) previous_message?: MessageInterface

  /** Variables */
  showMessageSendingDate: boolean = false

  @onlineClients.Getter
  clients!: number[]

  /** Methods */
  duelUser () {
    this.$socket.client.emit("challengeUser", {
      user_id: this.message.owner.id
    }, (data: any) => {
      if (data.error) {
        this.$toast.error(data.error)
      } else if (this.$auth.user) {
        this.$toast.info(`You challenged ${this.$auth.user.login}`)
      }
    })
  }

  /** Computed */
  get authenticatedId(): number {
    if (!this.$auth || !this.$auth.user)
      return -1
    else
      return (this.$auth.user as any).id
  }

  get previousMessageOwnerID(): number {
    if (this.previous_message === null)
      return -1
    else if (this.previous_message)
      return this.previous_message?.owner.id
    else
      return -1
  }

  get classes(): string[] {
    if (this.previousMessageOwnerID !== this.message.owner.id && this.authenticatedId !== this.message.owner.id)
      return ['speech-bubble-left pl-2 w-max pr-2 order-2 ml-2']
    else if (this.previousMessageOwnerID !== this.message.owner.id && this.authenticatedId === this.message.owner.id)
      return ['speech-bubble-right text-right pl-2 pr-2 w-max ml-auto order-2 ml-2']
    else if (this.previousMessageOwnerID === this.message.owner.id && this.authenticatedId === this.message.owner.id)
      return ['speech-bubble-right-without-triangle pl-2 text-right pr-2 w-max ml-auto']
    else if (this.previousMessageOwnerID === this.message.owner.id && this.authenticatedId !== this.message.owner.id)
      return ['speech-bubble-left-without-triangle pl-2 w-max pr-2']
    else
      return []
  }

  get messageDateClasses(): string[] {
    if (this.authenticatedId !== this.message.owner.id)
      return ['right-0']
    else
      return []
  }

  get userNameClasses(): string[] {
    if (this.authenticatedId !== this.message.owner.id)
      return ['order-2 ml-2']
    else
      return ['order-1']
  }

  get isOwnerOnline () : boolean {
    return this.clients.includes(this.message.owner.id)
  }

}
</script>

<style scoped>

.speech-bubble-left {
  position: relative;
  background: #2F5D76;
  border-radius: .4em;
  margin-left: 10px;
  color: #EEEBDE;
  margin-top: 10px;
}

.speech-bubble-left:after {
  content: '';
  position: absolute;
  top: 0;
  left: 15px;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-bottom-color: #2F5D76;
  border-top: 0;
  border-left: 0;
  margin-left: -10.5px;
  margin-top: -10px;
}

.speech-bubble-right {
  margin-right: 10px;
  position: relative;
  background: #FBBF24;
  border-radius: .4em;
  color: #111927;
  margin-top: 10px;
}

.speech-bubble-right:after {
  content: '';
  position: absolute;
  top: 0;
  right: 5px;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-bottom-color: #FBBF24;
  border-top: 0;
  border-right: 0;
  margin-left: -10.5px;
  margin-top: -10px;
}

.speech-bubble-right-without-triangle {
  margin-right: 10px;
  position: relative;
  background: #FBBF24;
  border-radius: .4em;
  color: #111927;
  margin-top: -4px;
}

.speech-bubble-left-without-triangle {
  margin-left: 10px;
  position: relative;
  background: #2F5D76;
  border-radius: .4em;
  color: #EEEBDE;
  margin-top: -4px;
}

</style>
