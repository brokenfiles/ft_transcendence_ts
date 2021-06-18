<template>
	<div class="flex flex-row justify-around items-center">
		<canvas id="canvas" ref="game" width="640" height="480" style="border: 1px solid black"
				class="bg-primary mt-12">
		</canvas>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "nuxt-property-decorator";
import {Socket} from "vue-socket.io-extended";
import {Pad} from "~/utils/classes/pad.class";
import {Ball} from "~/utils/classes/ball.class";
import {BallInterface} from "~/utils/interfaces/game/ball.interface";
import {Context} from "@nuxt/types";

interface Keys {
	pressed: string[]
}

@Component({
  middleware: ['auth']
})
export default class Game extends Vue {

  /** Variables */

  /** Methods */

  mounted () {

  }

}

</script>

<style scoped>

</style>
