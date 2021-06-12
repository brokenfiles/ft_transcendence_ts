<template>
  <div class="relative">
    <button @click="buttonClicked" :class="borderClasses" class="mb-2 w-full block px-10 py-3 text-center uppercase font-bold focus:outline-none">
      <slot></slot>
    </button>
    <div class="absolute z-50 top-full left-0 right-0 bg-cream text-primary p-2" v-if="open">
      <p>Until</p>
      <client-only>
        <date-picker class="text-primary calendar" placeholder="MM/DD/YYYY" format="MM/dd/yyyy" v-model="model_time"></date-picker>
      </client-only>
      <div v-if="has_reason">
        <label for="reason" class="block mt-2">Reason</label>
        <input v-model="model_reason" id="reason" type="text" class="w-full bg-cream border border-primary focus:outline-none p-1">
      </div>
      <button class="mt-2 w-full block bg-red-400 py-0.5 text-center uppercase font-bold rounded-md focus:outline-none"
              @click="confirmClick">
        Apply
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'

@Component({})
export default class AdminTimedActions extends Vue {

  /** Properties */
  @Prop({required: true}) colors!: string
  @Prop({required: true}) has_reason!: boolean

  /** Models */
  model_time: Date = new Date()
  model_reason: string = ''

  /** Variables */
  open: boolean = false

  /** Methods */
  buttonClicked() {
    this.open = !this.open
  }

  confirmClick() {
    if (confirm("Are you sure?")) {
      this.$emit('verdictApplied', {
        until: this.model_time,
        reason: this.model_reason
      })
      this.open = false
      this.model_time = new Date()
      this.model_reason = ''
    }
  }

  /** Computed */
  get borderClasses(): string {
    if (!this.open) {
      return `rounded-md ${this.colors}`
    } else {
      return `rounded-t-md ${this.colors}`
    }
  }

}
</script>

<style>

.calendar input {
  width: 100%;
  padding: 5px;
  @apply bg-cream border border-primary focus:outline-none
}

</style>
