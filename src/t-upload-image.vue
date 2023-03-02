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
import { createDefaultImageWriter, openDefaultEditor } from '@vt7/pintura'
import { defineComponent, PropType, ref, toRefs } from '@vue/composition-api'
import TUpload from '@thinkvn/ui/components/upload/t-upload.vue'
import {
  fileUpload,
  getDimensionFile,
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

    allowFileDimensionValidation: { type: Boolean, default: false },
    ratio: { type: Number, default: 1 },
    size: { type: Object as PropType<Dimension>, default: undefined },
    forceType: { type: String, default: 'jpeg' },

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
      ratio,
      size,
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

        originFile.value = file

        await validateDimension(file, {
          allowFileDimensionValidation: allowFileDimensionValidation.value,
          size: size.value,
          callbackCrop: async () => {
            isTransformFile.value = true

            const promise = new Promise<File>((resolve, reject) => {
              const editor = openDefaultEditor({
                src: file,
                utils: ['crop'],
                cropEnableButtonFlipHorizontal: true,
                cropEnableButtonFlipVertical: true,
                imageCropMinSize: size.value,
                imageCropAspectRatio: ratio.value,
                imageWriter: createDefaultImageWriter({
                  mimeType: guesstimateMimeType(forceType.value),
                  targetSize: size.value,
                }),
              })

              editor.on('process', data => {
                resolve(data.dest)
              })

              editor.on('cancel', () => {
                reject()
              })
            })

            try {
              file = await promise
              transformFile.value = file

              console.log('size', await getDimensionFile(transformFile.value))

              emit('crop', file)
            } catch (e) {}
          },
        })

        await validateFileType(file, {
          allowFileTypeValidation: allowFileTypeValidation.value,
          allowConvertFileType: allowConvertFileType.value,
          acceptedFileTypes: acceptedFileTypes.value,
          callbackConvertFileType: async () => {
            const newFile = await onConvertFileType(file, forceType.value)
            isTransformFile.value = true

            file = toFile(newFile, file.name)

            transformFile.value = file

            emit('convert', file)
          },
        })

        await validateFileSize(file, {
          allowFileSize: allowFileSize.value,
          allowCompress: allowCompress.value,
          maxFileSize: maxFileSize.value,
          callbackCompress: async () => {
            isCompressing.value = true
            isTransformFile.value = true
            originFile.value = file

            const blob = await fileUpload(file, { key: props.apiKey })

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

        emit('change', file)
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
