<template>
  <div>
    <canvas ref="game" :width="this.match.gameWith" :height="this.match.gameHeight"
            class="bg-primary mt-12 border border-primary">
    </canvas>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {MatchInterface} from "~/utils/interfaces/game/match.interface";

@Component({})
export default class Pong extends Vue {

  /** Properties */
  @Prop({required: true}) match!: MatchInterface

  /** Variables */
  context?: CanvasRenderingContext2D | null
  canvas?: HTMLCanvasElement

  /** Methods */
  mounted () {
    const $refs = (this.$refs) as any
    if ($refs) {
      this.canvas = $refs.game
      if (this.canvas) {
        this.context = this.canvas.getContext("2d")
      }
    } else {
      this.$toast.error(`Sorry, canvas can't be initiated`)
      this.$router.push('/')
    }
  }

}
</script>

<style scoped>

</style>
