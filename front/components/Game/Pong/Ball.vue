<template>
  <div>
    <span class="absolute w-2 h-2 bg-white z-50" :style="{top: `${positionY}px`, left: `${positionX}px`}"></span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: "Ball",

  data() {
    return {
      positionY: 0,
      positionX: 0
    }
  },

  methods: {
    changeBallPosition(event: KeyboardEvent) {
      const step = 5
      if (event.key === 'ArrowUp') {
        this.positionY -= step
      } else if (event.key === 'ArrowDown') {
        this.positionY += step
      } else if (event.key === 'ArrowLeft') {
        this.positionX -= step
      } else if (event.key === 'ArrowRight') {
        this.positionX += step
      }
    },

  },

  mounted() {
    document.addEventListener('keydown', this.changeBallPosition)
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.changeBallPosition)
  }
})
</script>

<style scoped>

</style>
