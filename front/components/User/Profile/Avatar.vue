<template>
  <div class="relative rounded-full bg-center bg-cover" :style="avatarStyle">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from "nuxt-property-decorator";

@Component
export default class Avatar extends Vue{

  /** Properties */
  @Prop({required: true}) readonly imageUrl!: string

  /** Computed */
  get avatarStyle () : any {
    if (this.imageUrl === "") {
      return {
        backgroundColor: `rgb(120, 120, 120)`
      }
    } else {
      return {
        backgroundImage: `url(${this.imageUrl})`
      }
    }
  }

}
</script>

<style scoped>

</style>
