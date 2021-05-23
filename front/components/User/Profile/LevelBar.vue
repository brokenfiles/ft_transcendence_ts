<template>
  <div class="w-1/3 border-2 border-white rounded-sm">
    <div class="py-1 text-center bg-transGradient bg-repeat-y" :style="{backgroundSize: `${width}% auto`}">
      lvl {{ level.toFixed(2) }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from "nuxt-property-decorator";

@Component({

})
export default class LevelBar extends Vue {

  @Prop({required: true}) readonly points!: number

  get level(): number {
    return (this.points / 100)
  }

  get width(): number {
    const level = this.level
    return ((level - (Math.trunc(level))) * 100)
  }

}
</script>

<style scoped>

</style>
