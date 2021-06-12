<template>
  <div>
    <button @click="buttonClicked" class="mb-2 block bg-red-200 text-red-800 px-10 py-3 text-center uppercase font-bold rounded-md focus:outline-none">
      <slot></slot>
    </button>
    <client-only>
      <date-picker v-if="open" class="text-primary" placeholder="MM/DD/YYYY" format="MM/dd/yyyy" v-model="model_time"></date-picker>
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'

@Component({})
export default class AdminTimedActions extends Vue {
  model_time: Date = new Date()
  open: boolean = false

  buttonClicked() {
    this.open = !this.open
  }
}
</script>

<style scoped>

</style>
