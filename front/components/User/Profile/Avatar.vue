<template>
  <div class="relative">
    <img :src="imageUrl" alt="Profile picture" class="rounded-full">
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
