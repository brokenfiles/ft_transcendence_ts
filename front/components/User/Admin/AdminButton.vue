<template>
  <div>
    <admin-timed-actions :has_reason="true" @verdictApplied="banishUser" colors="bg-red-200 text-red-800">banish</admin-timed-actions>
    <admin-timed-actions :has_reason="false" @verdictApplied="blockUser" colors="bg-blue-200 text-blue-800">block</admin-timed-actions>
    <admin-role-changer :current_role="user.role" @changedRole="changeRole" v-if="isAdmin"></admin-role-changer>
  </div>
</template>

<script lang="ts">

import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import AdminTimedActions from "~/components/User/Admin/AdminTimedActions.vue";
import {UserInterface} from "~/utils/interfaces/users/user.interface";
import AdminRoleChanger from "~/components/User/Admin/AdminRoleChanger.vue";
import {Role} from "~/utils/enums/role.enum";

interface Verdict {
  until: Date,
  reason: string
}

@Component({
  components: {
    AdminTimedActions,
    AdminRoleChanger
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
      if (verdict.until < new Date)
        this.$toast.success('user has been successfully unbanned')
      else
        this.$toast.success('user has been successfully banished')
      this.$emit('adminActionPerformed')
    }).catch((err) => {
      this.$toast.error(err.response.data.message[0])
    })
  }

  blockUser(verdict: Verdict) {
    this.$axios.patch(`/users/${this.user.id}`, {
      blocked: verdict.until
    }).then(() => {
      if (verdict.until < new Date)
        this.$toast.success('user has been successfully unblocked')
      else
        this.$toast.success('user has been successfully blocked')
      this.$emit('adminActionPerformed')
    }).catch((err) => {
      this.$toast.error(err.response.data.message[0])
    })
  }

  changeRole(newRole: Role) {
    this.$axios.patch(`/users/${this.user.id}`, {
      role: newRole
    }).then(() => {
      this.$toast.success(`${this.user.display_name} is now ${newRole}`)
      this.$emit('adminActionPerformed')
    }).catch((err) => {
      this.$toast.error(err.response.data.message[0])
    })
  }

  /** Computed */
  get isAdmin(): boolean {
    return this.$auth.user && this.$auth.user.role === Role.Administrator
  }

}

</script>

<style scoped>

</style>
