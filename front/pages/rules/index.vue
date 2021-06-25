<template>
  <div class="mt-8 w-full">
    <div class="mx-auto w-full md:w-1/3">
      <span class="text-4xl text-center">
        Game rules
      </span><br><br>
      <span class="text-2xl text-center">
        How to play ?
      </span><br>
      <p class="ml-4 text-left">
        - Click on the <span class="bg-yellow text-sm pb-1 text-primary px-4 pt-1 font-semibold">play now  <font-awesome-icon :icon="['fas', 'play']"></font-awesome-icon></span> button or on <span class="bg-secondary px-2 pt-1 pb-1">Join a queue</span> to search a battle.<br>
        - Once you've got an opponent the match launches after 3sec.<br>
        - After the countdown the ball is moving and the game is on !<br><br>
      </p>
      <span class="text-2xl text-center">
        During the game
      </span><br>
      <p class="ml-4">
        - Move your pad by moving your mouse and try not to let it pass.<br>
        - The battle is over when a player has reached 10 points.<br><br>
      </p>
      <span class="text-2xl text-center">
        After the game
      </span><br>
      <p class="ml-4">
        - You are redirected on the record page where you'll see the battle stats.<br>
        - The winner gets elos and the looser looses elos.<br>
        - You can play again by clicking in the <span class="bg-yellow text-sm text-primary px-4 pb-1 pt-1 font-semibold">play again</span> button.<br>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'

@Component({})
export default class extends Vue {

}
</script>

<style scoped>

</style>
