<template>
  <t-upload v-slot="{ on }" :accept="acceptedFileTypes.join(', ')" @input="onSelectFile">
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
// @ts-ignore
import MessageBox from 'element-ui/packages/message-box'
import { createDefaultImageWriter, processDefaultImage } from '@vt7/pintura'
import type { PinturaEditorDefaultOptions } from '@vt7/pintura'
import { defineComponent, PropType, ref, toRefs } from 'vue'
import TUpload from '@thinkvn/ui/components/upload/t-upload.vue'
import {
  bytesToSize,
  fileUpload,
  getDimensionFile,
  getExtensionFromFilename,
  getNameFromFilename,
  guesstimateMimeType,
  onConvertFileType,
  validateDimension,
  validateFileSize,
  validateFileType,
} from './utils'
import type { Dimension } from './types'
import { createCompareImage } from './image-compare'
import 'element-ui/lib/theme-chalk/message-box.css'
import '@vt7/pintura/pintura.css'

export default defineComponent({
  components: { TUpload },

  props: {
    allowFileTypeValidation: { type: Boolean, default: false },
    allowConvertFileType: { type: Boolean, default: false },
    acceptedFileTypes: { type: Array as PropType<string[]>, default: () => ['image/*'] },
    forceType: { type: String, default: '' },

    allowFileDimensionValidation: { type: Boolean, default: false },
    allowResizeFile: { type: Boolean, default: false },
    targetSize: { type: Object as PropType<Dimension>, default: undefined },
    minSize: { type: Object as PropType<Dimension>, default: undefined },
    fit: { type: String as PropType<'contain' | 'cover' | 'force'>, default: 'contain' },

    allowFileSize: { type: Boolean, default: false },
    allowCompress: { type: Boolean, default: false },
    maxFileSize: { type: Number, default: 400 * 1024 },
    apiKey: { type: String, default: '' },
  },

  emits: ['crop', 'convert', 'compress:error', 'compress:success', 'change'],

  setup(props, { emit }) {
    const isCompressing = ref(false)
    const isCompressed = ref(false)
    const isTransformFile = ref(false)
    const originFile = ref<File>()
    const transformFile = ref<File>()
    const key = ref('')

    const {
      allowFileTypeValidation,
      allowConvertFileType,
      acceptedFileTypes,
      allowFileDimensionValidation,
      allowResizeFile,
      targetSize,
      minSize,
      forceType,
      allowFileSize,
      allowCompress,
      maxFileSize,
    } = toRefs(props)

    const toFile = (data: Blob | File, filename: string) => {
      const mimeType = forceType.value || getExtensionFromFilename(filename)

      const newFileName = `${getNameFromFilename(filename)}.${mimeType}`

      return new File([data], newFileName, {
        type: guesstimateMimeType(mimeType),
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
      const file = files[0]

      try {
        reset()

        originFile.value = file
        transformFile.value = file

        await handleValidateDimension(transformFile.value)
        await handleValidateFileType(transformFile.value)
        await handleValidateFileSize(transformFile.value)

        console.log('final size: ', await getDimensionFile(transformFile.value))

        emit('change', transformFile.value)
      } catch (e) {
        console.log('e', e)
      }
    }

    const handleValidateDimension = async (file: File) => {
      const data = await processDefaultImage(file, {
        imageWriter: createDefaultImageWriter({
          mimeType: forceType.value && guesstimateMimeType(forceType.value),
          targetSize: {
            ...targetSize.value,
            fit: props.fit,
            upscale: false,
          },
        }),
      })

      const resizedSize = await getDimensionFile(data.dest)

      return validateDimension(file, {
        allowFileDimensionValidation: allowFileDimensionValidation.value,
        allowResizeFile: allowResizeFile.value,
        targetSize: targetSize.value,
        minSize: minSize.value || targetSize.value,
        resizedSize,
        callbackResize: () => {
          isTransformFile.value = true

          try {
            transformFile.value = data.dest

            emit('crop', transformFile.value)
          } catch (e) {}
        },
      })
    }

    const handleValidateFileType = (file: File) => {
      return validateFileType(file, {
        allowFileTypeValidation: allowFileTypeValidation.value,
        allowConvertFileType: allowConvertFileType.value,
        acceptedFileTypes: acceptedFileTypes.value,
        callbackConvertFileType: async () => {
          const newFile = await onConvertFileType(file, forceType.value || 'jpg')
          isTransformFile.value = true

          transformFile.value = toFile(newFile, file.name)

          emit('convert', file)
        },
      })
    }

    const handleValidateFileSize = (file: File) => {
      const compressError = () => {
        isCompressing.value = false
        isTransformFile.value = false
        emit('compress:error')

        throw new Error('compress:error')
      }

      return validateFileSize(file, {
        allowFileSize: allowFileSize.value,
        allowCompress: allowCompress.value,
        maxFileSize: maxFileSize.value,
        callbackCompress: async () => {
          isCompressing.value = true
          isTransformFile.value = true
          originFile.value = file

          const blob = await fileUpload(file, { key: props.apiKey })

          if (!blob) {
            MessageBox.alert('Nén ảnh không thành công', 'Cảnh báo', {
              confirmButtonText: 'OK',
            })

            return compressError()
          }

          const newFile = toFile(blob, file.name)

          if (newFile.size <= maxFileSize.value) {
            transformFile.value = newFile
            isCompressing.value = false
            isCompressed.value = true

            emit('compress:success', newFile)
          } else {
            MessageBox.alert(`Không thể nén ảnh xuống ${bytesToSize(maxFileSize.value)}`, 'Cảnh báo', {
              confirmButtonText: 'OK',
            })

            return compressError()
          }
        },
      })
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
