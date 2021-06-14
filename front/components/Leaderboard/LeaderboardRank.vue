<template>
  <div :style="{backgroundColor: color}" class="rounded-md p-1 text-center">
    <span class="font-semibold text-primary">{{ rankNumber }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'

@Component({})
export default class LeaderboardRank extends Vue {

  /** Properties */
  @Prop({required: true}) rankNumber!: number

  /** Methods */
  get color(): string {
    if (this.rankNumber === 1)
      return 'rgb(255, 218, 24)'
    else if (this.rankNumber === 2)
      return 'rgb(196, 196, 196)'
    else if (this.rankNumber === 3)
        return 'rgb(191, 119, 52)'
    else
      return 'rgba(0, 0, 0, 0)'
  }

}
</script>

<style scoped>

</style>
