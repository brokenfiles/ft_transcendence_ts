<template>
  <div class="h-24 w-24 rounded-full flex justify-center items-center relative cursor-help"
       @mouseenter="hasMouseHover = true"
       @mouseleave="hasMouseHover = false"
       :style="{backgroundColor: color}">
    <p class="text-center font-semibold w-20 whitespace-nowrap overflow-hidden overflow-ellipsis">{{ name }}</p>
    <popup :body="description" :header="name" :open="hasMouseHover"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from "nuxt-property-decorator";
import Popup from "~/components/Core/Popup.vue";

@Component({
  components: {
    Popup
  }
})
export default class Achievement extends Vue {

  hasMouseHover!: boolean = false

  @Prop({required: true}) readonly name!: string
  @Prop({required: true}) readonly description!: string
  @Prop({required: true}) readonly color!: string

}
</script>

<style scoped>

</style>
