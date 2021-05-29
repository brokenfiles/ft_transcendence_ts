<template>
  <div class="p-2">
    <div class="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" viewBox="0 0 50 50" fill="none">
        <path d="M47.05 2.95H39.7V0.5H10.3V2.95H2.95C1.48 2.95 0.5 3.93 0.5 5.4V11.28C0.5 16.915 4.665 21.57 10.3 22.305V22.55C10.3 29.655 15.2 35.535 21.815 37.005L20.1 42.15H14.465C13.485 42.15 12.505 42.885 12.26 43.865L10.3 49.5H39.7L37.74 43.865C37.495 42.885 36.515 42.15 35.535 42.15H29.9L28.185 37.005C34.8 35.535 39.7 29.655 39.7 22.55V22.305C45.335 21.57 49.5 16.915 49.5 11.28V5.4C49.5 3.93 48.52 2.95 47.05 2.95ZM10.3 17.405C7.605 16.67 5.4 14.22 5.4 11.28V7.85H10.3V17.405ZM29.9 25L25 22.305L20.1 25L21.325 20.1L17.65 15.2H22.795L25 10.3L27.205 15.2H32.35L28.675 20.1L29.9 25ZM44.6 11.28C44.6 14.22 42.395 16.915 39.7 17.405V7.85H44.6V11.28Z" fill="url(#paint0_linear)"/>
        <defs xmlns="http://www.w3.org/2000/svg">
          <linearGradient id="paint0_linear" x1="25" y1="0.5" x2="25" y2="49.5" gradientUnits="userSpaceOnUse">
            <stop stop-color="#A831D1"/>
            <stop offset="1" stop-color="#B81261"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <p class="mt-3 text-center font-semibold">{{ value }} {{ unity }}</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'

@Component({})
export default class Statistic extends Vue {

  @Prop({required: true}) readonly value!: number
  @Prop({required: true}) readonly unity!: string

}
</script>

<style scoped>

</style>
