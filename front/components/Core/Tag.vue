<template>
  <span class="px-2 py-1 rounded-sm relative">
    <slot></slot>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'

@Component({})
export default class Tag extends Vue {

}
</script>

<style scoped>

</style>
