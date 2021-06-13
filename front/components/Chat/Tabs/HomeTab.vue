<template>
  <div>
    <button v-if="in_creation === false && channel_category === ''" @click="in_creation = true"
            class="text-cream bg-secondary border border-cream p-2 focus:outline-none w-full">
      Create a channel
    </button>

    <div v-if="in_creation">
      <channel-creation @createdChannel="in_creation = false" @close="in_creation = false"/>
    </div>

    <div v-else-if="channel_category === ''">
      <channel-category @pickCategory="changeCategory" category="Private"/>
      <channel-category @pickCategory="changeCategory" category="Public"/>
    </div>

    <div v-else>
      <back-button @back="channel_category = ''">Back to home</back-button>
<!--      display the channels if there are private or public-->
      <channel v-for="(channel, index) in channels" class="my-2"
               :channel="channel" :key="`channel-${index}`"
               :channel_category="channel_category.toLowerCase()"
               @click="changeCurrChannel(channel)"/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {ChannelInterface} from "~/utils/interfaces/chat/channel.interface";
import Channel from "~/components/Chat/Channel.vue";
import UserPicker from "~/components/Core/UserPicker.vue";
import Avatar from "~/components/User/Profile/Avatar.vue";
import ChannelCategory from "~/components/Chat/Tabs/Components/ChannelCategory.vue";
import ChannelCreation from "~/components/Chat/Tabs/Components/ChannelCreation.vue";
import BackButton from "~/components/Chat/Tabs/Components/BackButton.vue";

@Component({
  components: {
    Channel,
    UserPicker,
    Avatar,
    ChannelCategory,
    ChannelCreation,
    BackButton
  }
})
export default class HomeTab extends Vue {

  /** Variables */
  in_creation: boolean = false
  channel_category: string = ''

  @Prop({required: true}) channels!: ChannelInterface[]

  changeCategory(categoryName: string) {
    this.channel_category = categoryName
  }

  changeCurrChannel(channel: ChannelInterface) {
    this.$emit('channelChanged', channel)
  }

}
</script>

<style scoped>

</style>
