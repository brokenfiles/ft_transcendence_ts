<template>
  <div>
    <div>
      <game class="pt-8"/>
    </div>
    <div>
      {{ this.clients }}
    </div>
    <div>
      <h1>{{this.$auth.user}}</h1>
    </div>
  </div>
</template>

<script lang="ts">


import {Component, namespace} from "nuxt-property-decorator";
import Vue from "vue";
import Game from "~/components/Game.vue";

const onlineClients = namespace('onlineClients')



@Component({
  components: {Game}
})
export default class Duel extends Vue {

  @onlineClients.Getter
  clients!: number[]

  head(){
    return {
      title: 'Game'
    }
  }

  get online(): number[]
  {
    return this.clients
  }

}

</script>

<style scoped>

</style>
