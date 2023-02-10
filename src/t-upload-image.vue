<template>
  <t-upload v-slot="{ on }" @input="onSelectFile">
    <slot
      v-bind="{
        on,
        isCompressing,
        isCompressed,
        isTransformFile,
        originFile,
        transformFile,
        onSelectFile,
        compareImage,
        reset,
      }"
    ></slot>
  </t-upload>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, toRefs } from '@vue/composition-api'
import TUpload from '@thinkvn/ui/components/upload/t-upload.vue'
import {
  checkApiStatus,
  fileUpload,
  getDimensionFile,
  getNameFromFilename,
  guesstimateMimeType,
  onConvertFileType,
  onCreateSlim,
  validateDimension,
  validateFileSize,
  validateFileType,
} from './utils'
import type { Dimension } from './types'
import { createCompareImage } from './image-compare'
import 'element-ui/lib/theme-chalk/message-box.css'

export default defineComponent({
  components: { TUpload },

  props: {
    allowFileTypeValidation: { type: Boolean, default: false },
    acceptedFileTypes: { type: Array as PropType<string[]>, default: () => ['image/*'] },

    allowFileDimensionValidation: { type: Boolean, default: false },
    ratio: { type: String, default: '' },
    size: { type: Object as PropType<Dimension>, default: undefined },
    minSize: { type: Object as PropType<Dimension>, default: undefined },
    forceType: { type: String, default: 'jpeg' },

    allowFileSize: { type: Boolean, default: false },
    allowCompress: { type: Boolean, default: false },
    maxFileSize: { type: Number, default: 400 * 1024 },
    apiKeys: { type: Array as PropType<string[]>, default: () => [] },
  },

  emits: ['crop', 'convert', 'compress:error', 'compress:success'],

  setup(props, { emit }) {
    const isCompressing = ref(false)
    const isCompressed = ref(false)
    const isTransformFile = ref(false)
    const originFile = ref<File>()
    const transformFile = ref<File>()
    const key = ref('')

    const {
      allowFileTypeValidation,
      acceptedFileTypes,
      allowFileDimensionValidation,
      ratio,
      size,
      minSize,
      forceType,
      allowFileSize,
      allowCompress,
      maxFileSize,
    } = toRefs(props)

    const toFile = (data: Blob | File, filename: string) => {
      const newFileName = `${getNameFromFilename(filename)}.${forceType.value}`

      return new File([data], newFileName, {
        type: guesstimateMimeType(forceType.value),
      })
    }

    const reset = () => {
      isCompressing.value = false
      isCompressed.value = false
      isTransformFile.value = false
      originFile.value = undefined
      transformFile.value = undefined
    }

    const onSelectFile = async (files: File[]) => {
      let file = files[0]

      try {
        reset()

        console.log('file 1', file, await getDimensionFile(file))

        originFile.value = file

        await validateDimension(file, {
          allowFileDimensionValidation: allowFileDimensionValidation.value,
          size: size.value,
          minSize: minSize.value,
          callbackCrop: async () => {
            isTransformFile.value = true

            const blob = await onCreateSlim(file, {
              ratio: ratio.value,
              size: size.value,
              minSize: minSize.value,
              forceType: forceType.value,
            })

            file = toFile(blob, file.name)
            transformFile.value = file

            emit('crop', file)
          },
        })

        console.log('file 2', file, await getDimensionFile(file))

        await validateFileType(file, {
          allowFileTypeValidation: allowFileTypeValidation.value,
          acceptedFileTypes: acceptedFileTypes.value,
          callbackConvertFileType: async () => {
            const newFile = await onConvertFileType(file, forceType.value)
            isTransformFile.value = true

            file = toFile(newFile, file.name)

            transformFile.value = file

            emit('convert', file)
          },
        })

        console.log('file 3', file, await getDimensionFile(file))

        await validateFileSize(file, {
          allowFileSize: allowFileSize.value,
          allowCompress: allowCompress.value,
          maxFileSize: maxFileSize.value,
          callbackCompress: async () => {
            isCompressing.value = true
            isTransformFile.value = true
            originFile.value = file

            const blob = await fileUpload(file)

            console.log('blob', blob)

            if (!blob) {
              isCompressing.value = false
              isTransformFile.value = false
              emit('compress:error')

              return
            }

            file = toFile(blob, file.name)

            transformFile.value = file
            isCompressing.value = false
            isCompressed.value = true

            emit('compress:success', file)
          },
        })

        console.log('file 4', file, await getDimensionFile(file))
      } catch (e) {
        console.log('e', e)
      }
    }

    const compareImage = async () => {
      const { width, height } = await getDimensionFile(originFile.value!)
      createCompareImage({
        leftImage: URL.createObjectURL(originFile.value!),
        leftImageSize: originFile.value?.size!,
        rightImage: URL.createObjectURL(transformFile.value!),
        rightImageSize: transformFile.value?.size!,
        width,
        height,
      })
    }

    onMounted(async () => {
      const data = await checkApiStatus('vPWT74PFUT3kB12tHZUk')

      console.log('data', data)
    })

    onMounted(() => {
      let slimScript = document.createElement('script')
      slimScript.setAttribute('src', 'https://cdn.jsdelivr.net/gh/vuthanhbayit/slim/slim.min.js')
      slimScript.setAttribute('defer', 'true')

      document.head.appendChild(slimScript)
    })

    return {
      isCompressing,
      isCompressed,
      isTransformFile,
      originFile,
      transformFile,
      onSelectFile,
      compareImage,
      reset,
      key,
    }
  },
})
</script>

<style>
@import url(https://cdn.jsdelivr.net/gh/vuthanhbayit/slim/slim.css);
</style>