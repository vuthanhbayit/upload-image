import type { Dimension } from '../types'

interface SlimInput extends File, Dimension {}

interface SlimOutput extends Dimension {
  image: HTMLCanvasElement
}

interface SlimOutputBase64 extends Dimension {
  image: string
  name: string
  type: string
}

interface SlimData<O = SlimOutput> {
  input: SlimInput
  output: O
}

interface SlimInstance {
  data: SlimData
  dataBase64: SlimData<SlimOutputBase64>
  element: HTMLElement
  destroy: () => void
  edit: () => void
  load: (file: File) => void
}

export interface Options {
  edit: any
  ratio: string
  size: Dimension
  crop: string
  instantEdit: boolean
  jpegCompression: number
  filterSharpen: number
  forceType: string
  forceSize: string
  forceMinSize: boolean
  defaultInputName: string
  minSize: Dimension
  maxFileSize: number
  saveInitialImage: boolean
  internalCanvasSize: string
  willTransform: () => void
  willSave: (data: SlimData, ready: (data: SlimData) => void) => void
  willRemove: (data: SlimData, remove: () => void) => void
  willLoad: () => void
  didInit: (data: SlimData) => void
  didLoad: () => string | boolean
  didTransform: () => void
  didCancel: () => void
  didConfirm: (data: SlimData, instance: SlimInstance) => void
  didSave: (data: SlimData, instance: SlimInstance) => void
  didRemove: (data: SlimData) => void
}

declare global {
  interface Window {
    Slim: {
      new (element: string | HTMLElement | null, options: Partial<Options>): SlimInstance
    }
  }
}

const SLIM_SELECTOR = 'slimSelector'

const getSlimNode = () => {
  return document.getElementById(SLIM_SELECTOR)
}

const createSlimNode = () => {
  if (getSlimNode()) return

  const body = document.body
  const slimNode = document.createElement('div')
  slimNode.id = SLIM_SELECTOR
  slimNode.style.display = 'none'

  body.appendChild(slimNode)
}

export const createSlim = (file: File, options: Partial<Options>) => {
  createSlimNode()

  const instance = new window.Slim(getSlimNode(), {
    ...options,
    didConfirm(data, instance) {
      options.didConfirm?.(data, instance)

      setTimeout(() => instance.destroy(), 1000)
    },
    didCancel() {
      options.didCancel?.()

      setTimeout(() => instance.destroy(), 1000)
    },
  })

  instance.load(file)

  return instance
}
