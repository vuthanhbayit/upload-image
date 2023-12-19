<template>
  <div class="image-compare-modal">
    <div class="modal-overlay" @click="onClose"></div>

    <div class="modal-content">
      <button aria-label="Đóng" class="image-compare-modal__close" @click="onClose">
        <span>x</span>
      </button>

      <div id="image-compare" ref="imageCompareRef" :style="stylesContent">
        <img :src="leftImage" alt="" />
        <img :src="rightImage" alt="" />
      </div>

      <div class="modal-footer">
        <div class="progress">
          <div class="progress-text-left" style="display: block">
            <div>
              <span class="original-size">{{ bytesToSize(leftImageSize) }}</span>
              &nbsp;
              <span class="rarr">→</span>
              &nbsp;
              <span class="optimized-size">{{ bytesToSize(rightImageSize) }}</span>
            </div>
          </div>

          <div></div>

          <div
            :aria-valuenow="percentImprovement"
            :style="{ width: percentImprovement + '%' }"
            aria-valuemax="100"
            aria-valuemin="0"
            class="progress-bar"
            role="progressbar"
          >
            <div class="progress-text">
              <span class="percentage-optimized">{{ percentImprovement }}</span>
              % image compression
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, onMounted, ref } from 'vue'
import { isString, toCssUnit } from '@thinkvn/utils'
// @ts-ignore
import ImageCompare from 'image-compare-viewer'
import { bytesToSize } from '../utils'

// @ts-ignore
import 'image-compare-viewer/dist/image-compare-viewer.min.css'

export default defineComponent({
  props: {
    leftImage: {
      type: String,
      default: '',
    },
    rightImage: {
      type: String,
      default: '',
    },
    leftImageSize: {
      type: Number,
      default: 0,
    },
    rightImageSize: {
      type: Number,
      default: 0,
    },
    width: {
      type: [Number, String],
      default: 'auto',
    },
    height: {
      type: [Number, String],
      default: 'auto',
    },
  },

  setup(props) {
    const instance = getCurrentInstance()
    const imageCompareRef = ref<HTMLElement>()
    const viewer = ref()

    const stylesContent = computed(() => {
      if (isString(props.width) || isString(props.height)) return { width: props.width, height: props.height }

      const padding = 50 * 2

      const originalWidth = props.width
      const originalHeight = props.height
      const originalRatio = originalWidth / originalHeight

      const screenWidth = window.innerWidth - padding
      const screenHeight = window.innerHeight - padding
      const screenRatio = screenWidth / screenHeight

      let newWidth, newHeight
      if (originalRatio > screenRatio) {
        newWidth = screenWidth
        newHeight = screenWidth / originalRatio
      } else {
        newHeight = screenHeight
        newWidth = screenHeight * originalRatio
      }

      return {
        height: toCssUnit(newHeight),
        width: toCssUnit(newWidth),
      }
    })

    onMounted(() => {
      if (!imageCompareRef.value) return

      viewer.value = new ImageCompare(imageCompareRef.value, options).mount()
    })

    const onClose = () => {
      instance?.proxy.$destroy()
    }

    return {
      bytesToSize,
      imageCompareRef,
      stylesContent,
      viewer,
      onClose,
      percentImprovement: computed(() => {
        if (!props.leftImageSize || !props.rightImageSize) return 0

        return Math.floor(((props.leftImageSize - props.rightImageSize) * 100) / props.leftImageSize)
      }),
    }
  },
})

const options = {
  // UI Theme Defaults
  controlColor: '#FFFFFF',
  controlShadow: true,
  addCircle: true,
  addCircleBlur: true,

  // Label Defaults
  showLabels: true,
  labelOptions: {
    before: 'Ảnh trước nén',
    after: 'Ảnh sau nén',
    onHover: false,
  },

  // Smoothing
  smoothing: true,
  smoothingAmount: 200,

  // Other options
  hoverStart: true,
  verticalMode: false,
  startingPoint: 50,
  fluidMode: false,
}
</script>

<style scoped>
.image-compare-modal {
  position: fixed;
  inset: 0;
  z-index: 99;
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  z-index: 100;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  z-index: 101;
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 50px * 2);
  max-width: calc(100% - 50px * 2);
  transform: translateY(-16px);
}

.image-compare-modal__close {
  z-index: 100;
  position: absolute;
  right: -12px;
  top: -12px;
  border-radius: 100%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  background: #fff;
  filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
  border: none;
}

.modal-footer {
  padding: 8px 16px;
  position: absolute;
  bottom: -44px;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 0 0 16px 16px;
}

#image-compare {
  position: relative;
  border-radius: 16px 16px 0 0;
}

.progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
  border-radius: 100px;
  background: #f2f2f2;
  position: relative;
}

.progress-text-left {
  position: absolute;
  left: 12px;
}

.progress-bar {
  display: flex;
  justify-content: flex-end;
  background: linear-gradient(90deg, #92d5e3 0%, #1abdca 100%);
  border-radius: 100px;
  padding: 0 12px;
}
</style>
