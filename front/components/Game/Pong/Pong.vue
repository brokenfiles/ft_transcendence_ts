<template>
  <div>
    <p class="flex w-full mt-12 text-2xl bg-primary">
      <span class="flex-1 text-left">
        <span class="text-yellow" v-if="match.players[1].guild">
          [{{ match.players[1].guild.anagram }}]
        </span>
        <span class="font-light">
          {{ match.players[1].display_name }}
        </span>
      </span>
      <span class="flex text-center">
        {{ player_1_points }} - {{ player_0_points }}
      </span>
      <span class="flex-1 text-right">
        <span class="text-yellow" v-if="match.players[0].guild">
          [{{ match.players[0].guild.anagram }}]
        </span>
        <span class="font-light">
          {{ match.players[0].display_name }}
        </span>
      </span>
    </p>
    <canvas ref="game" :width="clientWidth" :height="clientHeight"
            class="border border-primary bg-game" :style="{backgroundImage: `url(${background})`}">
    </canvas>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {
  Coordinates, GameFinishedInterface,
  Keys,
  MatchInterface,
  Pad,
  PlayerMarkedInterface,
  ResetCanvasInterface
} from "~/utils/interfaces/game/match.interface";
import {Socket} from "vue-socket.io-extended";
import {BallInterface} from "~/utils/interfaces/game/ball.interface";
import {GameState} from "~/utils/enums/game-state.enum";
import {UserInterface} from "~/utils/interfaces/users/user.interface";

@Component({})
export default class Pong extends Vue {

  /** Properties */
  @Prop({required: true}) match!: MatchInterface

  /** Variables */
  context?: CanvasRenderingContext2D | null
  canvas?: HTMLCanvasElement
  player_0_points: number = 0
  player_1_points: number = 0
  keys: Keys = {
    pressed: []
  }
  game_state: GameState = GameState.WARMING
  loop_id: number = -1

  /** Methods */
  mounted() {
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

    this.player_0_points = 0
    this.player_1_points = 0
    /* Event listeners */
    if (this.isAPlayer) {
      document.addEventListener('mousemove', this.mouseMoveEvent)
      // avert the backend that the player is ready to play
      this.$socket.client.emit(`clientReadyToPlay`)
    } else {
      this.game_state = GameState.IN_GAME
      // avert the backend that the player is ready to play
      this.$socket.client.emit(`clientJoinedSpectator`, this.match.uuid)
      this.loop_id = window.setInterval(this.updateGame, 20)
    }
  }

  beforeDestroy() {
    // destroying the component
    if (this.isAPlayer) {
      document.removeEventListener('mousemove', this.mouseMoveEvent)
      this.$socket.client.emit(`clientLeftGame`)
    }
    clearInterval(this.loop_id)
  }

  mouseMoveEvent(event: MouseEvent) {
    if (this.game_state === GameState.IN_GAME) {
      let match = this.match as any
      let pad = match[this.userPad] as Pad
      if (this.canvas) {
        let rect = this.canvas.getBoundingClientRect();
        const mouseCoordinates = {
          y: (event.clientY - rect.top) * this.ratioHeight
        }
        if (mouseCoordinates.y - pad.height / 2 <= 0) {
          mouseCoordinates.y = pad.height / 2
        } else if (mouseCoordinates.y + pad.height / 2 >= this.match.gameHeight) {
          mouseCoordinates.y = this.match.gameHeight - pad.height / 2
        }
        this.clearRect(pad.coordinates, pad.width, pad.height)
        pad.coordinates.y = mouseCoordinates.y - pad.height / 2
        this.$socket.client.emit(`clientUpdatedPadPosition`, pad.coordinates)
        this.printRectangle(this.match.leftPad.coordinates, this.match.leftPad.width, this.match.leftPad.height, 'red')
        this.printRectangle(this.match.rightPad.coordinates, this.match.rightPad.width, this.match.rightPad.height, 'red')
      }
    }
  }

  printRectangle(coordinates: Coordinates, w: number, h: number, color: string) {
    if (this.context) {
      // this.context.clearRect(coordinates.x, coordinates.y, w, h)
      this.context.beginPath()
      this.context.fillStyle = `${color}`
      this.context.fillRect(coordinates.x / this.ratioWidth, coordinates.y / this.ratioHeight,
        w / this.ratioWidth, h / this.ratioHeight)
    }
  }

  clearRect(coordinates: Coordinates, w: number, h: number) {
    if (this.context) {
      this.context.clearRect(coordinates.x / this.ratioWidth - 1, coordinates.y / this.ratioHeight - 1,
        w / this.ratioWidth + 2, h / this.ratioHeight + 2)
    }
  }

  updateBallPosition() {
    this.printRectangle(this.match.ball.coordinates, 10, 10, "white")
  }

  changePadPosition(way: string) {
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
  updateGame() {
    if (this.game_state !== GameState.IN_GAME)
      return ;

    if (this.keys.pressed.includes('ArrowDown'))
      this.changePadPosition("down")
    if (this.keys.pressed.includes("ArrowUp"))
      this.changePadPosition("up")

    this.printRectangle(this.match.leftPad.coordinates, this.match.leftPad.width, this.match.leftPad.height,
      'red')
    this.printRectangle(this.match.rightPad.coordinates, this.match.rightPad.width, this.match.rightPad.height,
      'red')
  }

  setPoints (playerId: number, points: number) {
    const map = this.match.players.map(u => u.id)
    if (map[0] === playerId)
      this.player_0_points = points
    else if (map[1] === playerId)
      this.player_1_points = points
  }

  otherPlayerPad(id: number): string {
    const map = this.match.players.map(u => u.id)
    if (map[0] === id)
      return 'rightPad'
    else
      return 'leftPad'
  }

  /** Sockets */
  @Socket("gameStarted")
  gameStartedEvent () {
    let seconds = 3
    const countdown = window.setInterval(() => {
      this.$toast.info(`Game starting in ${seconds --} seconds...`)
      if (seconds === 0) {
        window.clearInterval(countdown)
      }
    }, 1000)
    if (this.loop_id !== -1) {
      window.clearInterval(this.loop_id)
    }
    this.loop_id = window.setInterval(this.updateGame, 20)
  }

  @Socket("otherPlayerPadUpdated")
  otherPlayerPadUpdatedEvent(payload: any) {
    let match = this.match as any
    let pad
    if (this.isAPlayer) {
      pad = match[this.otherPad] as Pad
    } else {
      const id = payload.sub
      pad = match[this.otherPlayerPad(id)]
    }
    this.clearRect(pad.coordinates, pad.width, pad.height)
    pad.coordinates = payload.coordinates
    this.printRectangle(pad.coordinates, pad.width, pad.height, 'red')
  }

  @Socket("ballUpdated")
  ballUpdatedEvent(ball: BallInterface) {
    this.clearRect({
      x: this.match.ball.coordinates.x - 1,
      y: this.match.ball.coordinates.y - 1
    }, 12, 12)
    this.match.ball = ball
    this.updateBallPosition()
  }

  @Socket("pointMarked")
  stopGame(payload: PlayerMarkedInterface) {
    this.$toast.info(`${payload.winner.login} marked a point!`)
    this.setPoints(payload.winner.id, payload.points)
  }

  @Socket("resetCanvas")
  resetCanvasEvent(resetPayload: ResetCanvasInterface) {
    this.clearRect({
      x: this.match.ball.coordinates.x - 1,
      y: this.match.ball.coordinates.y - 1
    }, 12, 12)
    this.match.ball = resetPayload.ball
    this.updateBallPosition()
    this.clearRect(this.match.rightPad.coordinates, this.match.rightPad.width, this.match.rightPad.height)
    this.clearRect(this.match.leftPad.coordinates, this.match.leftPad.width, this.match.leftPad.height)
    this.match.rightPad = resetPayload.rightPad
    this.match.leftPad = resetPayload.leftPad
    this.printRectangle(this.match.rightPad.coordinates, this.match.rightPad.width, this.match.rightPad.height, 'red')
    this.printRectangle(this.match.leftPad.coordinates, this.match.leftPad.width, this.match.leftPad.height, 'red')
  }

  @Socket("stateUpdated")
  stateUpdatedEvent(newState: GameState) {
    this.game_state = newState
  }

  @Socket("gameFinished")
  gameFinishedEvent(gameFinishedEvent: GameFinishedInterface) {
    this.$toast.success(`${gameFinishedEvent.winner.display_name} won the game!`)
    window.setTimeout(() => {
      this.$router.push(`/game/records/${this.match.uuid}`)
    }, 2000)
  }

  /** Computed */
  get isAPlayer(): boolean {
    return (this.$auth.user && this.match.players.map(u => u.id).includes(this.$auth.user.id))
  }

  get userPad(): string {
    const map = this.match.players.map(u => u.id)
    const userId = this.$auth.user ? this.$auth.user.id : -1
    if (map[0] === userId)
      return 'rightPad'
    else
      return 'leftPad'
  }

  get otherPad(): string {
    const map = this.match.players.map(u => u.id)
    const userId = this.$auth.user ? this.$auth.user.id : -1
    if (map[0] !== userId)
      return 'rightPad'
    else
      return 'leftPad'
  }

  get background(): string {
    const uuid = this.match.uuid
    const images = [
      "https://image.freepik.com/free-vector/versus-vs-screen-banner-battle-comparision_1017-26142.jpg",
      "https://image.freepik.com/free-vector/low-poly-style-vs-versus-banner_1017-26141.jpg",
      "https://image.freepik.com/free-vector/battle-screen-versus-vs-background-template-design_1017-27090.jpg",
      "https://image.freepik.com/free-vector/red-blue-light-sparkle-versus-vs-screen_1017-26145.jpg"
    ]
    return images[uuid.charCodeAt(0) % images.length]
  }

  get clientWidth () : number {
    if (process.client) {
      if (window.innerWidth <= this.match.gameWith) {
        return this.match.gameWith / 1.5
      } else if (window.innerWidth >= 900) {
        return this.match.gameWith * 1.5
      }
    }
    return this.match.gameWith
  }

  get clientHeight () : number {
    if (process.client) {
      if (window.innerWidth <= this.match.gameWith) {
        return this.match.gameHeight / 1.5
      }
    }
    return this.match.gameHeight
  }

  get ratioWidth () : number {
    return this.match.gameWith / this.clientWidth
  }

  get ratioHeight () : number {
    return this.match.gameHeight / this.clientHeight
  }

}
</script>

<style scoped>

.bg-game {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

</style>
