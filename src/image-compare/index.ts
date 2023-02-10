import Vue from 'vue'
import CompareImageView from './image-compare.vue'

interface Options {
  leftImage: string
  rightImage: string
  leftImageSize: number
  rightImageSize: number
  width?: number
  height?: number
}

const createCompareImage = (propsData: Options) => {
  const Instance = Vue.extend(CompareImageView as any)
  const container = document.body

  const instance = new Instance({
    el: container.appendChild(document.createElement('div')),
    propsData: {
      ...propsData,
    },
    destroyed() {
      container.removeChild(instance.$el)
    },
  })
}

export { createCompareImage }
