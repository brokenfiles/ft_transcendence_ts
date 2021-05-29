<template>
  <div>
    <h1>{{this.$auth.user}}</h1>
    <h1>#{{online}}#</h1>
  </div>
</template>

<script lang="ts">

import {Component, namespace} from "nuxt-property-decorator";

import Vue from "vue";

const onlineClients = namespace('onlineClients')

@Component({})
export default class Duel extends Vue {

  @onlineClients.Getter
  clients!: number[]

  mounted()
  {
  }

  get online(): number[]
  {
    return this.clients
  }

}

</script>

<style scoped>

</style>
