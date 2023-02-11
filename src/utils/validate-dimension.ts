// @ts-ignore
import MessageBox from 'element-ui/packages/message-box'
import type { Dimension } from '../types'
import { getDimensionFile } from './dimension'

export const confirmCrop = async (originSize: Dimension, size: Dimension) => {
  try {
    await MessageBox.confirm(
      `<div>
           <div>Bạn đang upload ảnh có kích thước ${originSize.width}x${originSize.height}</div>
           <div>Bạn cần upload ảnh có kích thước ${size.width}x${size.height}</div>
      </div>`,
      'Cảnh báo',
      {
        confirmButtonText: 'Cắt ảnh này',
        cancelButtonText: 'Upload ảnh khác',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )

    return true
  } catch {
    return false
  }
}

export const notifyInvalidMinSize = async (originSize: Dimension, size: Dimension) => {
  try {
    await MessageBox.confirm(
      `<div>
           <div>Bạn đang upload ảnh có kích thước ${originSize.width}x${originSize.height}</div>
           <div>Bạn cần upload ảnh có kích thước ${size.width}x${size.height}</div>
      </div>`,
      'Cảnh báo',
      {
        showConfirmButton: false,
        cancelButtonText: 'Upload ảnh khác',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )

    return true
  } catch {
    return false
  }
}

export const validateDimension = async (
  file: File,
  {
    allowFileDimensionValidation,
    size,
    callbackCrop,
  }: {
    allowFileDimensionValidation: boolean
    size?: Dimension
    callbackCrop?: () => Promise<void>
  }
) => {
  if (!allowFileDimensionValidation) return true

  const originSize = await getDimensionFile(file)
  let isValidMinSize = true
  let isValidSize = true

  if (size) {
    isValidMinSize = originSize.width >= size.width && originSize.height >= size.height
  }

  if (size) {
    isValidSize = originSize.width === size.width && originSize.height === size.height
  }

  if (!isValidMinSize && size) {
    await notifyInvalidMinSize(originSize, size)
    // eslint-disable-next-line no-throw-literal
    throw 'INVALID_DIMENSION_MIN_SIZE'
  }

  if (!isValidSize && size) {
    const isConfirm = await confirmCrop(originSize, size)

    if (!isConfirm || !callbackCrop) {
      // eslint-disable-next-line no-throw-literal
      throw 'INVALID_DIMENSION_SIZE'
    } else {
      await callbackCrop()
    }
  }

  return true
}
