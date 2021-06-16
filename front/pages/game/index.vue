<template>
  <div class="">

    <canvas id="canvas" ref="game" width="640" height="480" style="border: 1px solid black"
            class="bg-primary mt-12">

    </canvas>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "nuxt-property-decorator";

interface Coordinates {
  x: number
  y: number
}

class Pad {

  coordinates: Coordinates = {
    x: 0,
    y: 0
  }
  w: number;
  h: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.coordinates.x = x
    this.coordinates.y = y
    this.w = w
    this.h = h
  }

  draw(context: CanvasRenderingContext2D | null, vector: string) {

    //probablement très peu fiable

    context?.clearRect(this.coordinates.x, this.coordinates.y, this.w, this.h)
    if (vector === "UP") {
      this.coordinates.y += 5
      if (this.coordinates.y + 74 > 480)
        this.coordinates.y = 480 - 74
    } else if (vector === "DOWN") {
      this.coordinates.y -= 5
      if (this.coordinates.y < 0)
        this.coordinates.y = 0
    }
    context?.beginPath();
    context?.fillRect(this.coordinates.x, this.coordinates.y, this.w, this.h)
  }
}

class Ball {

  coordinates: Coordinates = {
    x: 0,
    y: 0
  }
  h: number = 0
  w: number = 0
  color: number = 0xfff
  xSpeed: number = 0
  ySpeed: number = 0

  constructor(x: number, y: number, w: number, h: number, color: number, xSpeed: number, ySpeed: number) {
    this.coordinates.x = x
    this.coordinates.y = y
    this.w = w
    this.h = h
    this.color = color
    this.xSpeed = xSpeed
    this.ySpeed = ySpeed
  }

  drawNextPosition(context: CanvasRenderingContext2D) {
    context.clearRect(this.coordinates.x, this.coordinates.y, this.w, this.h)
    this.coordinates.x += this.xSpeed
    this.coordinates.y += this.ySpeed
    if (this.coordinates.y <= 0 || this.coordinates.y + this.h / 2 >= 480)
      this.ySpeed *= -1
    if (this.coordinates.x <= 0 || this.coordinates.x + this.w / 2 >= 640)
      this.xSpeed *= -1
    context.beginPath()
    context.fillRect(this.coordinates.x, this.coordinates.y, this.w, this.h)
  }

}

interface Keys {
  pressed: string[]
}

@Component({})
export default class Game extends Vue {

  context!: CanvasRenderingContext2D | null
  canvas!: HTMLCanvasElement

  rightPad!: Pad
  leftPad!: Pad
  ball!: Ball
  keys: Keys = {
    pressed: []
  }
  stop: boolean = false

  mounted() {
    this.canvas = document.getElementById('canvas') as
      HTMLCanvasElement;
    this.context = this.canvas.getContext("2d")

    this.rightPad = new Pad(620, 480 / 2 - 74 / 2, 10, 74)
    this.leftPad = new Pad(10, 480 / 2 - 74 / 2, 10, 74)
    this.ball = new Ball(620 / 2 - 5, 480 / 2 - 5, 10, 10, 0xfff, 3, -3)

    this.createPad(this.rightPad)
    this.createPad(this.leftPad)
    this.createBall(this.ball)

    document.addEventListener('keydown', this.keyDownEvent)
    document.addEventListener('keyup', this.keyUpEvent)
    this.loop()
  }

  beforeDestroy() {
    document.removeEventListener('keydown', this.keyDownEvent)
    document.removeEventListener('keyup', this.keyUpEvent)
    this.stop = true
  }

  async loop() {
    if (this.context) {
      setTimeout(() => {

        if (this.keys.pressed.includes('ArrowDown')) {
          this.rightPad.draw(this.context, 'UP')
        }
        if (this.keys.pressed.includes('ArrowUp')) {
          this.rightPad.draw(this.context, 'DOWN')
        }
        this.ball.drawNextPosition(this.context)
        if (!this.stop)
          this.loop()
      }, 20)
    }
  }

  keyDownEvent(event: KeyboardEvent) {
    console.log(event.code)
    if (!this.keys.pressed.includes(event.code)) {
      this.keys.pressed.push(event.code)
    }
  }

  keyUpEvent(event: KeyboardEvent) {
    if (this.keys.pressed.includes(event.code)) {
      const idx = this.keys.pressed.indexOf(event.code)
      this.keys.pressed.splice(idx, 1)
    }
  }

  createPad(pad: Pad) {
    if (this.context) {
      this.context.fillStyle = "#FF0000";
      this.context.fillRect(pad.coordinates.x, pad.coordinates.y, pad.w, pad.h)
    }
  }

  createBall(ball: Ball) {
    if (this.context) {
      this.context.fillStyle = "#FFF"
      this.context.fillRect(ball.coordinates.x, ball.coordinates.y, ball.w, ball.h)
    }
  }

  downPad() {
    this.rightPad.draw(this.context, "UP")
  }

  upPad() {
    this.rightPad.draw(this.context, "DOWN")
  }
}

</script>

<style scoped>

</style>
