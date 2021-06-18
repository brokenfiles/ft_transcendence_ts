<template>
  <div class="w-full h-full flex flex-col items-center justify-center"
       :class="{'searching': player === null}"
       :style="{backgroundColor: this.color}">
    <avatar class="w-24 h-24 mx-auto" :image-url="avatar"/>
    <p class="mt-4 p-2 rounded-lg font-semibold text-xl" :style="styleForElement(name, '')">
      <span v-if="guild" :class="{'opacity-0': !guild}" class="font-normal">[{{ guild }}] </span>
      {{ name }}
    </p>
    <p class="mt-1 rounded-lg" :style="styleForElement(points, -1)">
      <font-awesome-icon :class="{'opacity-0': points === -1}" :icon="['fas', 'trophy']"/>
      <span v-if="points !== -1">
        {{ points }} points
      </span>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {UserInterface} from "~/utils/interfaces/users/user.interface";
import Avatar from "~/components/User/Profile/Avatar.vue";

@Component({
  components: {
    Avatar
  }
})
export default class QueueSlot extends Vue {

  /** Properties */
  @Prop({required: true}) player?: UserInterface | null
  @Prop({required: true}) color!: string

  styleForElement (variable: any, value: any) : any {
    if (variable === value) {
      return {
        backgroundColor: `rgb(120, 120, 120)`,
        width: '50%'
      }
    } else {
      return {}
    }
  }

  /** Computed */
  get avatar () : string {
    if (this.player) {
      return this.player.avatar
    }
    return ""
  }

  get name () : string {
    if (this.player) {
      return this.player.display_name
    }
    return ""
  }

  get guild () : string | boolean | undefined {
    if (this.player && this.player.guild) {
      return this.player.guild?.name
    }
    return false
  }

  get points () : number {
    if (this.player) {
      return this.player.points
    }
    return -1
  }

}
</script>

<style scoped>

.searching::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0.4;
  background: linear-gradient(-45deg, #848484, #616161, #848484, #404040);
  background-size: 400% 400%;
  animation: gradient 4s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

</style>
