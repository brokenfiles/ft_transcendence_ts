<template>
  <div>
    <h2 class="text-center text-2xl font-bold my-8">
      Settings
    </h2>
    <div class="bg-secondary text-cream p-4 w-full md:mx-auto md:w-2/3 w-full">
      <form action="#" @submit.prevent="saveSettings">
        <div class="flex flex-wrap items-center w-full">
          <label for="double_auth" class="flex-1">2 factor authentication (google authenticator)</label>
          <input id="double_auth" v-model="twoFactorAuth" type="checkbox">
        </div>
        <button type="submit" class="bg-yellow text-primary px-4 py-2 mt-4 w-full">Save</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'

@Component({
  middleware: ['auth']
})
export default class SettingsPage extends Vue {

  twoFactorAuth: boolean = false

  mounted() {
    this.twoFactorAuth = (this.$auth.user as any).double_auth
  }

  saveSettings () {
    this.$axios.patch(`/users/me`, {
      double_auth: this.twoFactorAuth
    }).then(() => {
      this.$toast.success('Your account settings have been updated')
      this.$auth.fetchUser()
    }).catch((err) => {
      this.$toast.error(err.response.data.message[0])
    })
  }

}
</script>

<style scoped>

</style>
