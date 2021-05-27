<template>
  <div>

  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'

/**
 * Ce component permet d'ajouter / supprimer un ami
 */
@Component({

})
export default class FriendButton extends Vue {

  @Prop({required: true}) isFriend!: boolean
  

}
</script>

<style scoped>

</style>
