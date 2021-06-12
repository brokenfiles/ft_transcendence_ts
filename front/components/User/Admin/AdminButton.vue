<template>
  <div>
    <admin-timed-actions :has_reason="true" @verdictApplied="banishUser" colors="bg-red-200 text-red-800">banish</admin-timed-actions>
    <admin-timed-actions :has_reason="false" @verdictApplied="blockUser" colors="bg-blue-200 text-blue-800">block</admin-timed-actions>
  </div>
</template>

<script lang="ts">

import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import AdminTimedActions from "~/components/User/Admin/AdminTimedActions.vue";
import {UserInterface} from "~/utils/interfaces/users/user.interface";

interface Verdict {
  until: Date,
  reason: string
}

@Component({
  components: {
    AdminTimedActions
  }
})
export default class AdminButton extends Vue {

  /** Properties */
  @Prop({required: true}) user!: UserInterface

  /** Methods */
  banishUser(verdict: Verdict) {
    this.$axios.patch(`/users/${this.user.id}`, {
      banned: verdict.until,
      ban_reason: verdict.reason
    }).then(() => {
        this.$toast.success('user has been successfully banished')
      }).catch((err) => {
        this.$toast.error(err.response.data.message[0])
    })
  }

  blockUser(verdict: Verdict) {
    this.$axios.patch(`/users/${this.user.id}`, {
      blocked: verdict.until
    }).then(() => {
      this.$toast.success('user has been successfully blocked')
    }).catch((err) => {
      this.$toast.error(err.response.data.message[0])
    })
  }

}

</script>

<style scoped>

</style>
