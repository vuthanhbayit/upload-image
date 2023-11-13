// @ts-ignore
import MessageBox from 'element-ui/packages/message-box'
import type { Dimension } from '../types'
import { getDimensionFile } from './dimension'

export const confirmCrop = async (originSize: Dimension, size: Dimension) => {
  try {
    await MessageBox.confirm(
      `<div>
           <div>Bạn đang upload ảnh có kích thước ${originSize.width}x${originSize.height}</div>
           <div>Bạn cần upload ảnh có kích thước là: ${size.width}x${size.height}</div>
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

export const notifyInvalidMinSize = async (originSize: Dimension, minSize: Dimension) => {
  try {
    await MessageBox.confirm(
      `<div>
           <div>Bạn đang upload ảnh có kích thước ${originSize.width}x${originSize.height}</div>
           <div>Bạn cần upload ảnh có kích thước thấp nhất là: ${minSize.width}x${minSize.height}</div>
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
    minSize,
    targetSize,
    callbackCrop,
  }: {
    allowFileDimensionValidation: boolean
    minSize: Dimension
    targetSize: Dimension
    callbackCrop?: () => Promise<void>
  }
) => {
  if (!allowFileDimensionValidation || !minSize) return true

  const originSize = await getDimensionFile(file)
  const isValidMinSize = originSize.width >= minSize.width && originSize.height >= minSize.height
  const isValidSize = originSize.width === targetSize.width && originSize.height === targetSize.height

  if (!isValidMinSize) {
    await notifyInvalidMinSize(originSize, minSize)
    // eslint-disable-next-line no-throw-literal
    throw 'INVALID_DIMENSION_MIN_SIZE'
  }

  if (!isValidSize) {
    const isConfirm = await confirmCrop(originSize, targetSize)

    if (!isConfirm || !callbackCrop) {
      // eslint-disable-next-line no-throw-literal
      throw 'INVALID_DIMENSION_SIZE'
    } else {
      await callbackCrop()
    }
  }

  return true
}
