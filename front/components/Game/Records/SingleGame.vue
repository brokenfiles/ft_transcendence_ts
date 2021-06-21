<template>
  <div>
    <p class="my-8 text-2xl text-center">Match against {{game.winner.display_name}} and {{game.looser.display_name}}</p>
    <div class="w-full p-2">
      <div class="h-full flex flex-wrap items-center justify-center text-center">
        <div class="w-full md:w-1/2 order-2 md:order-1 h-full">
          <div class="text-primary text-left">
            <div class="bg-cream flex px-4 py-2">
              <p class="flex-1 font-semibold">About</p>
              <client-only>
                <p>
                  <timeago :datetime="game.created_at">{{ game.created_at }}</timeago>
                </p>
              </client-only>
            </div>
            <div class="bg-gray-300 flex px-4 py-2">
              <p class="flex-1 font-semibold">Winner</p>
              <p>{{ game.winner.display_name }}</p>
            </div>
            <div class="bg-cream flex px-4 py-2">
              <p class="flex-1 font-semibold">State</p>
              <p>{{ game.state }}</p>
            </div>
            <div class="bg-gray-300 flex px-4 py-2">
              <p class="flex-1 font-semibold">Points</p>
              <p>
                {{game.winner_points}}
                <span class="mx-4">-</span>
                {{game.looser_points}}
              </p>
            </div>
          </div>
          <nuxt-link to="/queue">
            <button class="text-primary w-full block bg-yellow py-2 px-4 mt-4">Play again</button>
          </nuxt-link>
        </div>
        <div class="w-full pb-8 md:pt-0 md:w-1/2 h-full">
          <div class="h-full flex flex-wrap items-center justify-center text-center relative">
            <div class="w-1/2 h-full relative">
              <avatar class="w-20 h-20 mx-auto" :image-url="game.winner.avatar"/>
              <p class="mt-4 p-2 font-semibold text-xl">
                <span v-if="game.winner.guild" :class="{'opacity-0': !game.winner.guild}" class="font-normal">[{{ game.winner.guild.name }}] </span>
                {{ game.winner.display_name }}
              </p>
              <p>
                {{game.winner.points}}
                <span class="text-green-400">(+ {{game.winner_points * 2.5}} ↑)</span>
                points
              </p>
            </div>
            <div class="w-1/2 h-full relative">
              <avatar class="w-20 h-20 mx-auto" :image-url="game.looser.avatar"/>
              <p class="mt-4 p-2 font-semibold text-xl">
                <span v-if="game.looser.guild" :class="{'opacity-0': !game.looser.guild}" class="font-normal">[{{ game.looser.guild.name }}] </span>
                {{ game.looser.display_name }}
              </p>
              <p>
                {{game.looser.points}} points
              </p>
            </div>
            <div class="absolute right-1/2 top-1/2 text-2xl transform translate-x-1/2">
              {{game.winner_points}}
              <span class="md:mx-4">-</span>
              {{game.looser_points}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {GameInterface} from "~/utils/interfaces/game/game.interface";
import Avatar from "~/components/User/Profile/Avatar.vue";

@Component({
  components: {
    Avatar
  }
})
export default class SingleGame extends Vue {

  /** Properties */
  @Prop({required: true}) game!: GameInterface

  /** Variables */

  /** Methods */

}
</script>

<style scoped>

</style>
