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
    this.$socket.client.emit(`clientJoinedMatch`, {
      uuid: this.$route.params.uuid
    }, (match: MatchInterface | undefined) => {
      console.log('match', match)
      if (!match) {
        this.$toast.error(`This game does not exist`)
        this.$router.push('/')
      } else {
        this.match = match
      }
    })
  }

}

</script>

<style scoped>

</style>
