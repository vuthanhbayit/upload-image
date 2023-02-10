<template>
  <div>
    <t-upload-image
      v-slot="{ on, percentSizeReduction, isCompressing, originFile, transformFile, isCompressed, compareImage }"
      :accepted-file-types="['image/*']"
      :api-keys="[
        'vPWT74PFUT3kB12tHZUk',
        'NhWyFdSOUHVq1B2PtsxN',
        'i2D9CVsLotb6D9ZWPP6O',
        'acuINGlkpF72be9zKUaj',
        'jptH7rtOsGwPoNmAxT3h',
      ]"
      :force-type="'jpeg'"
      :min-size="{ width: 1600, height: 900 }"
      :ratio="'16:9'"
      :size="{ width: 1600, height: 900 }"
      allow-compress
      allow-file-dimension-validation
      allow-file-size
      allow-file-type-validation
    >
      <table v-if="isCompressed">
        <tr>
          <td>Before</td>
          <td>Status</td>
          <td>After</td>
          <td>Action</td>
        </tr>

        <tr>
          <td>{{ originFile.size }}</td>
          <td>-{{ percentSizeReduction }}%</td>
          <td>{{ transformFile.size }}</td>
          <td>
            <button @click="compareImage">Compare</button>
          </td>
        </tr>
      </table>
      <button v-else :disabled="isCompressing" v-on="on">
        <span v-if="isCompressing">Đang nén ảnh</span>
        <span v-else>Thêm ảnh</span>
      </button>
    </t-upload-image>
    abc
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from '@vue/composition-api'
import TUploadImage from '../../../src/t-upload-image.vue'

export default defineComponent({
  name: 'IndexPage',

  components: {
    TUploadImage,
  },

  setup() {
    onMounted(() => {
      console.log('abc')
    })
  },
})
</script>
