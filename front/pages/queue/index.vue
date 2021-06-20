<template>
  <div>
    <div class="my-8 flex items-end justify-center space-x-4">
      <h1 class="text-5xl font-semibold text-center text-cream">
        Searching a battle
      </h1>
      <client-only>
        <hollow-dots-spinner
          :animation-duration="1000"
          :dot-size="15"
          :dots-num="3"
          color="#EEEBDE"
        />
      </client-only>
    </div>
    <queue v-if="isSocketConnected" :user="this.$auth.user"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'
import Queue from "~/components/Game/Queue/Queue.vue";

@Component({
  components: {
    Queue
  },
  middleware: ['auth']
})
export default class JoinQueue extends Vue {

  /** Computed */
  get isSocketConnected() : boolean {
    return (process.client && this.$socket.connected)
  }

}
</script>

<style scoped>

</style>
