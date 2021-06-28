<template>
	<div :class="active ? 'show_part' : 'hidden_part'" class="notification flex flex-col items-center bg-primary bg-opacity-95 z-50 rounded border border-yellow shadow-2xl">
		<div class="flex">
			<div class="text-yellow p-2">INVITATION TO PLAY</div>
			<div @click="stopInterval" class="p-2 cursor-pointer">✖️</div>
		</div>
		<span class="text-cream">name: {{ this.requester_name }}</span>
		<span class="text-cream">elo: {{ this.requester_elo }}</span>
		<button class="p-2 m-2 bg-yellow hover:bg-yellow_less text-black font-bold rounded text-center w-36" @click="startDuel">Accept Duel [{{ this.time }}]</button>
	</div>
</template>

<script lang="ts">
import {Component} from "nuxt-property-decorator";
import Vue from 'vue';
import {Socket} from "vue-socket.io-extended";

@Component({})
export default class Queue extends Vue {

  /** Variables */
	active: boolean = false
	requester_name: string = ""
	requester_elo: number = -1
	requester_id: number = -1
	time: number = 10
	interval: number = -1

  /** Methods */
  beforeDestroy () {
    this.stopInterval()
  }

	stopInterval() {
		if (this.interval) {
			clearInterval(this.interval);
			this.active = false
			this.time = 10
		}
	}

	startDuel() {
		this.active = false
		this.$socket.client.emit("startPrivateChallenge", {
			user_id: this.requester_id
		}, (data: any) => {
		  if (data.error) {
		    this.$toast.error(data.error)
      }
		})
	}

  @Socket('receiveGameNotify')
  addMessage(payload: any) {
    if (!this.isAvailable) {
      this.$toast.error(`You received a game request, but you can't accept here`)
      return ;
    }

    this.requester_name = payload.requester_name
    this.requester_elo = payload.requester_elo
    this.requester_id = payload.requester_id

    this.active = true
    const interval = window.setInterval(() => {
      this.time--
    }, 1000)

    window.setTimeout(() => {
      clearInterval(interval);
      this.active = false
      this.time = 10
    }, 1000 * 10);
  }

	@Socket("gameDuelStarting")
	gameStartingEvent (gameStartingOptions: any) {
		if (gameStartingOptions.players_entity && gameStartingOptions.players_entity.length === 2) {
			this.$toast.info(`Match ${gameStartingOptions.players_entity[0].display_name} VS ${gameStartingOptions.players_entity[1].display_name} starting...`)
			setTimeout(() => {
				this.$router.push(`/game/${gameStartingOptions.uuid}`)
			}, 3000)
		}
	}

	/** Computed */
	get isAvailable () : boolean {
	  return (process.client && !this.$route.path.includes('/game/'))
  }

}
</script>

<style scoped>

.hidden_part
{
	/*visibility: hidden;*/
	top: -50%;
	transition: all 1s;

}

.show_part
{
	top: 30%;
	transition: all 1s;

}

.notification
{
	position: fixed;
	width: 250px;
	/*height: 200px;*/
	left: 50%;
	margin-top: -100px; /* Negative half of height. */
	margin-left: -125px; /* Negative half of width. */
	transition: top 1s;
}

</style>
