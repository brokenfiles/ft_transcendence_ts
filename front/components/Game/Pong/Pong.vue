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
import {Coordinates, Keys, MatchInterface} from "~/utils/interfaces/game/match.interface";

@Component({})
export default class Pong extends Vue {

  /** Properties */
  @Prop({required: true}) match!: MatchInterface

  /** Variables */
  context?: CanvasRenderingContext2D | null
  canvas?: HTMLCanvasElement
  keys: Keys = {
    pressed: []
  }

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

    /* Event listeners */
    document.addEventListener('keydown', this.keyDownEvent)
    document.addEventListener('keyup', this.keyUpEvent)
  }

  beforeDestroy () {
    // destroying the component
    document.removeEventListener('keydown', this.keyDownEvent)
    document.removeEventListener('keyup', this.keyUpEvent)
  }

  /**
   * When a user press on a key
   * @param {KeyboardEvent} event
   */
  keyDownEvent (event: KeyboardEvent) {
    if (!this.keys.pressed.includes(event.code)) {
      this.keys.pressed.push(event.code)
    }
  }

  /**
   * When a user releases a key
   * @param {KeyboardEvent} event
   */
  keyUpEvent (event: KeyboardEvent) {
    if (this.keys.pressed.includes(event.code)) {
      const idx = this.keys.pressed.indexOf(event.code)
      this.keys.pressed.splice(idx, 1)
    }
  }

  printRectangle (coordinates: Coordinates, w: number, h: number, color: string) {
    if (this.context) {
      this.context.fillStyle = `${color}`
      this.context.fillRect(coordinates.x, coordinates.y, w, h)
    }
  }

  /**
   * Update the game
   */
  updateGame () {
    this.printRectangle(this.match.leftPad.coordinates, this.match.leftPad.width, this.match.leftPad.height, 'white')
    this.printRectangle(this.match.rightPad.coordinates, this.match.rightPad.width, this.match.rightPad.height, 'white')
    this.printRectangle(this.match.ball.coordinates, 10, 10, 'white')
  }

}
</script>

<style scoped>

</style>
