<template>
  <div class="online-icon rounded-full border-8" :class="classes">
    <div v-if="online" class="absolute w-full h-full rounded-full top-0 left-0 opacity-0 sonar-wave"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'

@Component
export default class UserOnlineIcon extends Vue {

  @Prop({required: true}) readonly isOnline!: boolean
  @Prop({required: true}) readonly isInGame!: boolean

  get online(): boolean {
    return (this.isOnline)
  }

  get inAGame(): boolean {
    return (this.isInGame)
  }

  get classes () : string {
    if (this.online) {
      if (this.inAGame) {
        return 'border-blue-500 bg-blue-700'
      } else {
        return 'border-onlineGreen bg-green-700'
      }
    } else {
      return 'border-offlineGray bg-ftgray'
    }
  }

}
</script>

<style scoped>

.sonar-wave {
  @apply bg-onlineGreen;
  pointer-events: none;
  animation: sonarWave 3s linear infinite;
}

@keyframes sonarWave {
  0% {
    opacity: 0.4;
  }
  20% {
    transform: scale(4);
    opacity: 0;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
