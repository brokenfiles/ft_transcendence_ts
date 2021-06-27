<template>
	<div>
    <div class="flex flex-row justify-around items-center" v-if="match">
      <pong :match="match"/>
    </div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from "nuxt-property-decorator";
import {MatchInterface} from "~/utils/interfaces/game/match.interface";
import Pong from "~/components/Game/Pong/Pong.vue";
import {GameState} from "~/utils/enums/game-state.enum";

@Component({
  middleware: ['auth'],
  components: {
    Pong
  }
})
export default class Game extends Vue {

  /** Variables */
  match: MatchInterface | null = null

  /** Methods */

  mounted () {
    this.$socket.client.emit(`getMatch`, {
      uuid: this.$route.params.uuid
    }, (match: MatchInterface | any) => {
      if (match.error) {
        this.$toast.error(match.error)
        this.$router.push('/')
      } else {
        this.match = match as MatchInterface
      }
    })
  }

}

</script>

<style scoped>

</style>
