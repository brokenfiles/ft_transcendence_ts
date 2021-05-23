<template>
  <div class="absolute bg-cream text-primary py-2 px-4 bottom-0 right-full w-max cursor-auto" :class="{'hidden': !open}">
    <h2 class="font-bold">{{ header }}</h2>
    <p>{{ body }}</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'

/**
 * This component must be used in a Relative context ! (The parent node must have `position: relative` style)
 */
@Component({})
export default class Popup extends Vue {

  @Prop({required: true}) readonly open!: boolean
  @Prop({required: true}) readonly header!: string
  @Prop({required: true}) readonly body!: string

}
</script>

<style scoped>

</style>
