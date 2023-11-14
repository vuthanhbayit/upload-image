<template>
  <div>
    <t-upload-image
      v-slot="{ on }"
      :accepted-file-types="['image/*']"
      :max-file-size="400 * 1024"
      :min-size="{ width: 2000, height: 1125 }"
      :short-pixel-api-keys="['i2D9CVsLotb6D9ZWPP6O', 'vPWT74PFUT3kB12tHZUk']"
      :target-size="{ width: 2000, height: 2000 }"
      allow-compress
      allow-file-dimension-validation
      allow-file-size
      allow-file-type-validation
      allow-resize-file
    >
      <button v-on="on">2000x2000</button>
    </t-upload-image>

    <t-upload-image
      v-slot="{ on }"
      :accepted-file-types="['image/*']"
      :max-file-size="100 * 1024"
      :min-size="{ width: 1200, height: 675 }"
      :short-pixel-api-keys="['i2D9CVsLotb6D9ZWPP6O', 'vPWT74PFUT3kB12tHZUk']"
      :target-size="{ width: 1200, height: 675 }"
      allow-compress
      allow-file-dimension-validation
      allow-file-size
      allow-file-type-validation
      fit="force"
      force-type="jpeg"
    >
      <button v-on="on">1200x675</button>
    </t-upload-image>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TUploadImage from '../../../src/t-upload-image.vue'

export default defineComponent({
  name: 'IndexPage',

  components: {
    TUploadImage,
  },
})
</script>
