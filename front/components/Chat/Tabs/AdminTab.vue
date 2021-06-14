<template>
  <div>
    <div v-if="channel">
      <back-button class="mb-2" @back="$emit('back')">Back to the channel</back-button>
      <select v-model="channel.privacy"
              class="block w-full focus:outline-none p-2 mb-2 bg-secondary border border-cream appearance-none">
        <option value="" disabled>Channel privacy</option>
        <option value="private">Private</option>
        <option value="password">Private with password</option>
        <option value="public">Public</option>
      </select>
      <div v-if="channel.privacy === 'password'">
        <input v-model="channel.password" class="block w-full focus:outline-none p-2 mb-2 bg-secondary border border-cream"
               type="password" placeholder="Channel password">
      </div>
      <div v-if="channel.privacy === 'private'">
        <p class="mb-2">Members in your channel</p>
        <user-picker @pickedUser="addUser" :added-users="channel.users" class="mb-2"/>
        <div class="mb-2">
          <div class="block w-full p-2 flex flex-wrap items-center focus:outline-none mb-0.5"
               v-for="(user, index) in channel.users" :key="`added-user-${index}`">
            <avatar class="w-10 h-10" :image-url="user.avatar"/>
            <span class="ml-2 block flex-1">
              {{ user.display_name }} <br/>
              <span class="text-sm font-semibold text-left block">
                {{ user.login }}
              </span>
            </span>
            <button @click="removeUser(user)" class="focus:outline-none p-2 bg-red-200 text-red-800">Remove</button>
          </div>
        </div>
      </div>
      <button @click="list_expanded = !list_expanded" class="block w-full focus:outline-none p-2 mb-2 bg-secondary border border-cream">
        {{!list_expanded ? 'Expand' : 'Retract'}} user list
      </button>
      <div v-if="list_expanded">
<!--        display list of users-->
      </div>
      <button class="w-full pr-1 focus:outline-none" @click="saveChannel">
          <span class="block text-cream bg-secondary border border-cream p-2">
            Save
          </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import BackButton from "~/components/Chat/Tabs/Components/BackButton.vue";
import {ChannelInterface} from "~/utils/interfaces/chat/channel.interface";
import UserPicker from "~/components/Core/UserPicker.vue";
import {UserInterface} from "~/utils/interfaces/users/user.interface";
import Avatar from "~/components/User/Profile/Avatar.vue";

@Component({
  components: {
    BackButton,
    UserPicker,
    Avatar
  }
})
export default class AdminTab extends Vue {

  /** Properties */
  @Prop({required: true}) current_channel!: ChannelInterface

  /** Variables */
  list_expanded: boolean = false

  /** Models */
  channel: ChannelInterface = {...this.current_channel}

  /** Hooks */
  mounted () {
    // if (this.current_channel) {
    //   this.model_privacy = this.current_channel.privacy
    //   this.added_users = this.current_channel.users
    // }
  }

  /** Methods */
  addUser(user: UserInterface) {
    this.current_channel.users.push(user)
  }

  removeUser(user: UserInterface) {
    const idx = this.current_channel.users.indexOf(user)
    if (idx !== -1)
      this.current_channel.users.splice(idx, 1)
  }

  saveChannel(): void {
    this.$socket.client.emit('changeChannelProperty', {
      channel_id: this.channel.id,
      privacy: this.channel.privacy,
      password: this.channel.password,
      _private_users: this.channel.users.map(u => u.id)
    })
    this.$toast.success(`Saving the channel`)
    this.$emit('channelSaved', this.channel)
  }

}
</script>

<style scoped>

</style>
