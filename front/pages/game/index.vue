<template>
	<div class="">

		<canvas id="canvas" ref="game" width="640" height="480" style="border: 1px solid black"
				class="bg-primary mt-12">

		</canvas>
		<button @click="downPad">Down</button>
		<button @click="upPad">Up</button>
		Game !!!
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "nuxt-property-decorator";

class Pad {

	x: number;
	y: number;
	w: number;
	h: number;

	constructor(x: number, y: number, w: number, h: number) {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}

	draw(context: CanvasRenderingContext2D | null, vector: string) {

		//probablement très peu fiable

		context?.clearRect(this.x, this.y, this.w, this.h)
		if (vector === "UP")
			this.y += 5
		else if (vector === "DOWN")
			this.y -= 5
		context?.beginPath();
		context?.fillRect(this.x, this.y, this.w, this.h)
	}
}

@Component({})
export default class Game extends Vue {

	context!: CanvasRenderingContext2D | null
	canvas!: HTMLCanvasElement

	rightPad!: Pad
	leftPad!: Pad

	mounted() {
		this.canvas = document.getElementById('canvas') as
			HTMLCanvasElement;
		this.context = this.canvas.getContext("2d")

		this.rightPad = new Pad(620, 0, 10, 75)
		this.leftPad = new Pad(10, 0, 10, 75)

		this.createPad(this.rightPad)
		this.createPad(this.leftPad)
	}

	createPad(pad: Pad) {
		if (this.context) {
			this.context.fillStyle = "#FF0000";
			this.context.fillRect(pad.x, pad.y, pad.w, pad.h)
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
