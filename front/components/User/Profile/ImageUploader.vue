<template>
  <div>
    <input type="file" ref="file" @change="uploadPicture($event)" accept="image/x-png,image/gif,image/jpeg"
           class="hidden">
    <button @click="$refs.file.click()"
            class="block bg-yellow text-primary focus:outline-none rounded-full p-2 flex justify-center items-center h-7 w-7">
      <font-awesome-icon :icon="['fas', 'edit']" size="xs"/>
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'

@Component({})
export default class ImageUploader extends Vue {

  /** Methods */

  /**
   * This function upload the image on cloudinary and returns the link to parent component
   * @param $event
   */
  uploadPicture($event: any): void {
    if ($event.target && $event.target.files.length > 0) {
      let data = new FormData()
      const file = $event.target.files[0]
      data.append('file', file, file.fileName)

      this.$axios.post(`cdn`, data, {
        headers: {
          'accept': 'application/json',
          'Content-Type': `multipart/form-data;boundary=${(data as any)._boundary}`
        }
      }).then((response) => {
        this.$emit('imageUploaded', {
          uuid: response.data.uuid,
          extension: response.data.extension
        })
      }).catch((err) => {
        this.$toast.error(err.response.data.message[0])
      })
    } else {
      this.$toast.error(`No file provided`)
    }
  }

}
</script>

<style scoped>

</style>
