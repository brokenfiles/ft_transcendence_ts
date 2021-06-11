<template>
  <div>
    <input v-model="model_channel" class="block w-full focus:outline-none p-2 mb-2 bg-secondary border border-cream"
           type="text" placeholder="Channel name">
    <select v-model="model_privacy"
            class="block w-full focus:outline-none p-2 mb-2 bg-secondary border border-cream appearance-none">
      <option value="" disabled>Channel privacy</option>
      <option value="private">Private</option>
      <option value="password">Private with password</option>
      <option value="public">Public</option>
    </select>
    <div v-if="model_privacy === 'password'">
      <input v-model="model_password" class="block w-full focus:outline-none p-2 mb-2 bg-secondary border border-cream"
             type="password" placeholder="Channel password">
    </div>
    <div v-if="model_privacy === 'private'">
      <p class="mb-2">Members in your channel</p>
      <user-picker @pickedUser="addUser" :added-users="added_users" class="mb-2"/>
      <div class="mb-2">
        <div class="block w-full p-2 flex flex-wrap items-center focus:outline-none mb-0.5"
             v-for="(user, index) in added_users" :key="`added-user-${index}`">
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
    <div class="flex flex-wrap">
      <button class="w-1/2 pr-1 focus:outline-none" @click="createChannel">
          <span class="block text-cream bg-secondary border border-cream p-2">
            Create
          </span>
      </button>
      <button class="w-1/2 pl-1 focus:outline-none" @click="$emit('close')">
          <span class="block text-cream bg-secondary border border-cream p-2">
            Cancel
          </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'
import {UserInterface} from "~/utils/interfaces/users/user.interface";
import UserPicker from "~/components/Core/UserPicker.vue";
import Avatar from "~/components/User/Profile/Avatar.vue";

@Component({
  components: {
    UserPicker,
    Avatar
  }
})
export default class ChannelCreation extends Vue {

  /** Models */
  model_channel: string = ''
  model_privacy: string = ''
  model_password: string = ''

  /** Variables */
  added_users: UserInterface[] = []

  createChannel() {
    const errors = this.inputErrors
    if (errors.length > 0) {
      for (const error of errors)
        this.$toast.error(error)
    } else {
      // here put the socket emits
      this.$socket.client.emit('createChannel', {
        name: this.model_channel,
        privacy: this.model_privacy,
        users: this.added_users.length > 0 ? this.added_users : false,
        password: this.model_password ? this.model_password : false
      })
      this.$emit('createdChannel', {
        channel: this.model_channel
      })
    }
  }

  addUser(user: UserInterface) {
    this.added_users.push(user)
  }

  removeUser(user: UserInterface) {
    const idx = this.added_users.indexOf(user)
    if (idx !== -1)
      this.added_users.splice(idx, 1)
  }

  get inputErrors() {
    let errors = []
    if (this.model_channel.length < 3 || this.model_channel.length > 16)
      errors.push(`The channel name len must be >= 3 and <= 16`)
    if (this.model_privacy === '')
      errors.push(`You have to choose a privacy`)
    if (this.model_privacy === 'password') {
      if (this.model_password.length < 3 || this.model_password.length > 16)
        errors.push(`The password len must be >= 3 and <= 16`)
    }
    return errors
  }

}
</script>

<style scoped>

</style>
