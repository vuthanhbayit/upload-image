<template>
  <div>
    <t-upload-image
      v-slot="{ on, percentSizeReduction, isCompressing, originFile, transformFile, isCompressed, compareImage }"
      :accepted-file-types="['image/*']"
      api-key="vPWT74PFUT3kB12tHZUk"
      :force-type="'jpeg'"
      :ratio="4/6"
      :size="{ width: 800, height: 1200 }"
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
