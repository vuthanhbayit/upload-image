// @ts-ignore
import MessageBox from 'element-ui/packages/message-box'
import { isEqual } from '@thinkvn/utils'
import type { Dimension } from '../types'
import { getDimensionFile } from './dimension'

export const confirmResize = async (originSize: Dimension, resizedSize: Dimension) => {
  try {
    await MessageBox.confirm(
      `<div>
           <div>Bạn đang upload ảnh có kích thước ${originSize.width}x${originSize.height}</div>
           <div>Chúng tôi sẽ tự động resize sang kích thước ${resizedSize.width}x${resizedSize.height}</div>
      </div>`,
      'Cảnh báo',
      {
        confirmButtonText: 'Resize ngay',
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
    allowResizeFile,
    minSize,
    targetSize,
    resizedSize,
    callbackResize,
  }: {
    allowFileDimensionValidation: boolean
    allowResizeFile: boolean
    minSize: Dimension
    targetSize: Dimension
    resizedSize: Dimension
    callbackResize: () => void
  }
) => {
  if (!allowFileDimensionValidation || !minSize) return true

  const originSize = await getDimensionFile(file)
  const isValidMinSize = originSize.width >= minSize.width
  const isValidSize = isEqual(originSize, targetSize) || isEqual(originSize, resizedSize)

  if (!isValidMinSize) {
    await notifyInvalidMinSize(originSize, minSize)
    // eslint-disable-next-line no-throw-literal
    throw 'INVALID_DIMENSION_MIN_SIZE'
  }

  if (!isValidSize) {
    if (allowResizeFile) {
      const isConfirm = await confirmResize(originSize, resizedSize)

      if (!isConfirm || !callbackResize) {
        // eslint-disable-next-line no-throw-literal
        throw 'INVALID_DIMENSION_SIZE'
      } else {
        await callbackResize()
      }
    } else {
      await notifyInvalidMinSize(originSize, targetSize)
      // eslint-disable-next-line no-throw-literal
      throw 'INVALID_DIMENSION_MIN_SIZE'
    }
  }

  return true
}
