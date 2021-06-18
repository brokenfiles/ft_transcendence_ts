<template>
  <div class="w-full">
    <nuxt-link :to="`/users/${message.owner.login}`" class="flex flex-wrap items-center"
         :class="{'text-right': authenticatedId === message.owner.id}"
         v-if="!previous_message || previous_message.owner.id !== message.owner.id">
      <avatar class="z-40 h-8 w-8"
              :class="{'order-2 ml-2': authenticatedId === message.owner.id}"
              :image-url="message.owner.avatar"/>
      <p class="flex-1 font-bold leading-3"
        :class="{'ml-2': authenticatedId !== message.owner.id}">
<!--        <span class="font-thin text-xs">-->
<!--          <client-only>-->
<!--            <timeago :datetime="message.created_at">{{ message.created_at }}</timeago>-->
<!--          </client-only>-->
<!--        </span>-->
      </p>
    </nuxt-link>
<!--    :class="{'pr-10 text-right bg-yellow text-black': authenticatedId === message.owner.id,-->
<!--    'pl-10 bg-gray-600': authenticatedId !== message.owner.id}"-->
    <p :class="{'speech-bubble-left pl-2 w-max pr-2': previousMessageOwnerID !== message.owner.id && authenticatedId !== message.owner.id,
     'speech-bubble-right text-right pl-2 pr-2 w-max ml-auto': previousMessageOwnerID !== message.owner.id && authenticatedId === message.owner.id,
     'speech-bubble-right-without-triangle pl-2 text-right pr-2 w-max ml-auto': previousMessageOwnerID === message.owner.id && authenticatedId === message.owner.id,
     'speech-bubble-left-without-triangle pl-2 w-max pr-2': previousMessageOwnerID === message.owner.id && authenticatedId !== message.owner.id}">
      {{ message.text }}
    </p>
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

  get previousMessageOwnerID(): number {
    if (this.previous_message === null)
      return -1
    else
      return this.previous_message?.owner.id
  }

}
</script>

<style scoped>

.speech-bubble-left {
  position: relative;
  background: #2F5D76;
  border-radius: .4em;
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
  position: relative;
  background: #FBBF24;
  border-radius: .4em;
  color: black;
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
  position: relative;
  background: #FBBF24;
  color: black;
  border-radius: .4em;
  margin-top: -4px;
}

.speech-bubble-left-without-triangle {
  position: relative;
  background: #2F5D76;
  border-radius: .4em;
  margin-top: -4px;
}

</style>
