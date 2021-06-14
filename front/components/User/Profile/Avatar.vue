<template>
  <div class="relative rounded-full bg-center bg-cover" :style="{backgroundImage: `url(${imageUrl})`}">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from "nuxt-property-decorator";

@Component
export default class Avatar extends Vue{

  @Prop({required: true}) readonly imageUrl!: string

}
</script>

<style scoped>

</style>
