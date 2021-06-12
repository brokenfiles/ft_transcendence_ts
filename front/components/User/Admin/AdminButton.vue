<template>
  <div>
    <admin-timed-actions>banish</admin-timed-actions>
  </div>
</template>

<script lang="ts">

import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'
import AdminTimedActions from "~/components/User/Admin/AdminTimedActions.vue";

@Component({
  components: {
    AdminTimedActions
  }
})
export default class AdminButton extends Vue {

}

</script>

<style scoped>

</style>
