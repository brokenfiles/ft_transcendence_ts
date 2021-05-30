<template>
  <div>
    <PhaserGame :createGame="createGame" v-if="createGame" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import PhaserGame from 'nuxtjs-phaser/dist/phaserGame.vue'
import {Component} from "nuxt-property-decorator";

const getGame = async (config = {}) => {
  const { default: createGame } = await import('../game/game')
  return createGame
}

@Component({
  components: {PhaserGame}
})
export default class Game extends Vue {

  name: 'IndexPage'
  data() {
    return {
      createGame: undefined,
    }
  }


  async asyncData() {
    let createGame: IndexPageData = undefined
    return createGame
  }


  createGame: IndexPageData = undefined

  async mounted() {
    this.createGame = await getGame()
    // this.$nextTick(() => setPhaserFocus())
  }

}
</script>
