<template>
  <div class="h-screen flex flex-col justify-center">
    <div class="max-w-6xl">
      <p class="text-5xl font-bold">Oops, an error occurred...</p>
      <p class="text-2xl">Error: {{error.statusCode}}</p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'

@Component({})
export default class ErrorPage extends Vue {

  /** Properties */
  @Prop() error!: any

  /** Variables */

  /** Methods */

}
</script>

<style scoped>

</style>
