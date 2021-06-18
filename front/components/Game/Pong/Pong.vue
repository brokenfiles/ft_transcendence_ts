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
import {Coordinates, Keys, MatchInterface, Pad} from "~/utils/interfaces/game/match.interface";
import {Socket} from "vue-socket.io-extended";

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
  loop_id: number = -1

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
    if (this.isAPlayer) {
      document.addEventListener('keydown', this.keyDownEvent)
      document.addEventListener('keyup', this.keyUpEvent)
    }

    this.loop_id = window.setInterval(this.updateGame, 20)
  }

  beforeDestroy () {
    // destroying the component
    if (this.isAPlayer) {
      document.removeEventListener('keydown', this.keyDownEvent)
      document.removeEventListener('keyup', this.keyUpEvent)
    }
    clearInterval(this.loop_id)
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
      // this.context.clearRect(coordinates.x, coordinates.y, w, h)
      this.context.fillStyle = `${color}`
      this.context.fillRect(coordinates.x, coordinates.y, w, h)
    }
  }

  clearRect (coordinates: Coordinates, w: number, h: number) {
    if (this.context) {
      this.context.clearRect(coordinates.x, coordinates.y - 1 , w, h + 2)
    }
  }

  changePadPosition (way: string) {
    let match = this.match as any
    let pad = match[this.userPad] as Pad
    if (way === "up") {
      this.clearRect(pad.coordinates, pad.width, pad.height)
      pad.coordinates.y -= 5
      if (pad.coordinates.y <= 0)
        pad.coordinates.y = 0
    } else if (way === "down") {
      this.clearRect(pad.coordinates, pad.width, pad.height)
      pad.coordinates.y += 5
      if (pad.coordinates.y + pad.height > this.match.gameHeight)
        pad.coordinates.y = this.match.gameHeight - pad.height
    }
    this.$socket.client.emit(`clientUpdatedPadPosition`, pad.coordinates)
  }

  /**
   * Update the game
   */
  updateGame () {
    if (this.keys.pressed.includes('ArrowDown'))
      this.changePadPosition("down")
    if (this.keys.pressed.includes("ArrowUp"))
      this.changePadPosition("up")

    this.printRectangle(this.match.leftPad.coordinates, this.match.leftPad.width, this.match.leftPad.height, 'red')
    this.printRectangle(this.match.rightPad.coordinates, this.match.rightPad.width, this.match.rightPad.height, 'red')
    this.printRectangle(this.match.ball.coordinates, 10, 10, 'white')
  }

  /** Sockets */
  @Socket("otherPlayerPadUpdated")
  otherPlayerPadUpdatedEvent (coordinates: Coordinates) {
    let match = this.match as any
    let pad = match[this.otherPad] as Pad
    this.clearRect(pad.coordinates, pad.width, pad.height)
    pad.coordinates = coordinates
    this.printRectangle(pad.coordinates, pad.width, pad.height, 'red')
  }

  /** Computed */
  get isAPlayer () : boolean {
    return (this.$auth.user && this.match.players.map(u => u.id).includes(this.$auth.user.id))
  }

  get userPad () : string {
    const map = this.match.players.map(u => u.id)
    const userId = this.$auth.user ? this.$auth.user.id : -1
    if (map[0] === userId)
      return 'rightPad'
    else
      return 'leftPad'
  }

  get otherPad () : string {
    const map = this.match.players.map(u => u.id)
    const userId = this.$auth.user ? this.$auth.user.id : -1
    if (map[0] !== userId)
      return 'rightPad'
    else
      return 'leftPad'
  }

}
</script>

<style scoped>

</style>
