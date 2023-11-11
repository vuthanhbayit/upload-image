<template>
  <div>
    <t-upload-image
      v-slot="{ on, percentSizeReduction, isCompressing, originFile, transformFile, isCompressed, compareImage }"
      :accepted-file-types="['image/*']"
      :max-file-size="400 * 1024"
      :min-size="{ width: 2000, height: 1125 }"
      :ratio="1"
      :target-size="{ width: 2000, height: 2000 }"
      allow-compress
      allow-file-dimension-validation
      allow-file-size
      allow-file-type-validation
      api-key="vPWT74PFUT3kB12tHZUk"
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
import { defineComponent, onMounted } from 'vue'
import TUploadImage from '../../../src/t-upload-image.vue'

export default defineComponent({
  name: 'IndexPage',

  components: {
    TUploadImage,
  },
})
</script>
