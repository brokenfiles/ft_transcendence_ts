s<template>
  <div @click="changeChannel(true)" tabindex="0" v-show="isVisible">
    <div v-if="connection_step === 0" class="w-full border-2 border-cream text-cream p-2 flex flex-wrap cursor-pointer items-center">
      <font-awesome-icon v-if="channel.privacy === 'password'"
                         class="mr-2 text-xs" :icon="['fas', 'lock']"/>
      <p class="flex-1">
        {{ channel.name }}
        <span class="text-gray-500 text-sm"> #{{channel.uuid.substr(0, 4)}}</span>
      </p>
      <div v-if="channel_category === 'private'">
        <button @click="leaveChannel()" class="focus:outline-none text-center">❌</button>
      </div>
      <svg class="mx-2 h-5 w-5 transform -rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
      <div v-else-if="connection_step === 1" class="w-full border-2 border-cream text-cream p-2 flex flex-wrap cursor-pointer">
        <input v-model="model_password" @keyup.enter.prevent="changeChannel(false)" class="block flex-1 w-full focus:outline-none px-2 bg-secondary"
               type="password" placeholder="Channel password">
        <svg @click="changeChannel(false)" class="mx-2 h-5 w-5 transform -rotate-90 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from "nuxt-property-decorator";
import {PrivacyEnum} from "~/utils/enums/privacy.enum";
import {ChannelInterface} from "~/utils/interfaces/chat/channel.interface";

enum ChannelConnectionStep {
  DEFAULT = 0,
  PASSWORD = 1
}

@Component({

})
export default class Channel extends Vue {

  /** Variables */
  connection_step: ChannelConnectionStep = ChannelConnectionStep.DEFAULT

  /** Models */
  model_password: string = ''

  /** Properties */
  @Prop({required: true}) channel!: ChannelInterface
  @Prop({required: true}) channel_category!: string

  /** Computed */
  get isVisible (): boolean {
    if (this.channel_category === 'public') {
      return (this.channel.privacy === PrivacyEnum.PASSWORD || this.channel.privacy === PrivacyEnum.PUBLIC)
    } else {
      return (this.channel.privacy === PrivacyEnum.PRIVATE)
    }
  }

  /** Methods */
  changeChannel (click: boolean) {
    const local_password = process.client ? localStorage.getItem(`channel-password-${this.channel.id}`) : null
    if (this.connection_step === ChannelConnectionStep.PASSWORD && click)
      return
    if (this.channel.privacy === PrivacyEnum.PASSWORD && this.connection_step === ChannelConnectionStep.DEFAULT
        && !local_password) {
        this.connection_step = ChannelConnectionStep.PASSWORD
    } else {
      this.connection_step = ChannelConnectionStep.DEFAULT
      this.channel.password = !local_password ? this.model_password : local_password
      this.model_password = ''
      this.$emit('changedChannel', this.channel)
    }
  }

  leaveChannel () {
    if (confirm(`Are you sure you want to quit this channel ?`)) {
      this.$socket.client.emit('leaveChannel', {
        channel_id: this.channel.id
      }, (data: any) => {
        if (data.error) {
          this.$toast.error(data.error)
        } else {
          this.$toast.success(data.success)
          this.$emit('leftChannel', this.channel.id)
        }
      })
    }
  }

}
</script>

<style scoped>

</style>
