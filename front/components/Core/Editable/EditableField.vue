<template>
  <component :is="tag" :class="componentClasses" @click="editable && editField()">
    <input ref="inputField" type="text" class="bg-transparent focus:outline-white"
           @blur="stopEdit" @keyup.enter.prevent="stopEditEnter" v-model="editingValue"
           :placeholder="placeholder"
           v-show="editing || (editingValue === '')">
    <span v-show="!editing">{{ !editingValue ? value : editingValue }}</span>
    <!-- Cette popup est là si on veut réactiver les popups sur les champs étitables -->
    <popup
      class="mr-2"
      header="You are editing a field"
      body="Just press enter or leave to save"
      :open="false"/>
  </component>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import Popup from "~/components/Core/Popup.vue";

@Component({
  components: {
    Popup
  }
})
export default class EditableField extends Vue {


  @Prop({required: true}) value!: string
  @Prop({required: false, default: false}) editable?: boolean

  @Prop({required: false, default: 'p'}) readonly tag?: string
  @Prop({required: false, default: ''}) readonly classes?: string

  @Prop({required: false, default: ''}) readonly placeholder?: string

  editing: boolean = false
  editingValue: string = this.value

  editField() {
    this.editing = true
    const element = (this.$refs as any).inputField
    this.$nextTick(() =>  element.focus())
  }

  stopEdit() {
    this.editing = false
    if (this.value !== this.editingValue)
      this.$emit('stopEditing', this.editingValue)
  }

  stopEditEnter() {
    this.editing = false
    if (this.editingValue.length === 0) {
      const element = (this.$refs as any).inputField as HTMLElement
      element.blur()
    }
  }

  get componentClasses() {
    return this.classes + ' ' + (this.editable ? 'cursor-pointer' : '') + ' relative'
  }

}
</script>

<style scoped>

input {
  font-weight: inherit;
}

</style>
