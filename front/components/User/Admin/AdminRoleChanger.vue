<template>
  <div>
    <select @change="changeRole" name="role" v-model="model_role" id="role" class="block w-full focus:outline-none p-2 mb-2 bg-secondary border border-cream appearance-none">
      <option value="administrator">Admin</option>
      <option value="moderator">Moderator</option>
      <option value="user">User</option>
    </select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {Role} from "~/utils/enums/role.enum";

@Component({

})
export default class AdminRoleChanger extends Vue {

  /** Properties */
  @Prop({required: true}) current_role!: Role

  /** Models */
  model_role: Role = this.current_role

  /** Methods */
  changeRole(): void {
    if (confirm('Are you sure ?')) {
      this.$emit('changedRole', this.model_role)
    }
  }
}
</script>

<style scoped>

</style>
