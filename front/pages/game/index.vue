<template>
	<div class="flex flex-row justify-around items-center">

		<canvas id="canvas" ref="game" width="640" height="480" style="border: 1px solid black"
				class="bg-primary mt-12">
		</canvas>

		<button @click="startGame" value class="p-4 w-24 border bg-green justify-center flex">{{ this.stop === 0 ? `Play` : `Stop` }}</button>

	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "nuxt-property-decorator";
import {Ball} from "~/pages/game/classes/ball.class";
import {Pad} from "~/pages/game/classes/pad.class";
import {Socket} from "vue-socket.io-extended";
import {BallInterface} from "../../../back/src/game/interfaces/game.interfaces";

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
	stop: number = 0

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

		this.$socket.client.emit('CreateGame', {
			width: 620,
			height: 480,
			rightPad: this.rightPad,
			leftPad: this.leftPad,
			ball: this.ball
		}, (data: any) => {
			this.$toast.info(data.msg)
		})

	}

	beforeDestroy() {
		document.removeEventListener('keydown', this.keyDownEvent)
		document.removeEventListener('keyup', this.keyUpEvent)
		if (this.stop !== 0)
			window.clearTimeout(this.stop)
	}

	startGame()
	{
		this.$socket.client.emit("PlayerReady", this.stop === 0, (state: any) => {

			if (this.context && state) {
				this.stop = window.setInterval(() => this.loop(), 20)
			}
			else
			{
				window.clearTimeout(this.stop)
				this.stop = 0
			}
		})
	}

	loop() {

		if (this.keys.pressed.includes('ArrowDown')) {
			this.rightPad.draw(this.context, 'UP')
			console.log(this.rightPad)
			this.$socket.client.emit("updatePadCoordinates", {
				coordinates: this.rightPad.coordinates,
				width: this.rightPad.w,
				height: this.rightPad.h
			})
		}
		if (this.keys.pressed.includes('ArrowUp')) {
			this.rightPad.draw(this.context, 'DOWN')
			this.$socket.client.emit("updatePadCoordinates", {
				coordinates: this.rightPad.coordinates,
				width: this.rightPad.w,
				height: this.rightPad.h
			})
		}
		this.ball.drawNextPosition(this.context)
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

	@Socket('BallHit')
	ballHitSomething(ball: BallInterface)
	{
		this.$toast.info("the ball hit something :d")
	}
}

</script>

<style scoped>

</style>
