// @ts-ignore
import MessageBox from 'element-ui/packages/message-box'
import type { Dimension } from '../types'
import type { Options } from './slim'
import { createSlim } from './slim'
import { getDimensionFile } from './dimension'

// eslint-disable-next-line @typescript-eslint/no-unused-vars,require-await
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

export const notifyInvalidMinSize = async (originSize: Dimension, minSize: Dimension) => {
  try {
    await MessageBox.confirm(
      `<div>
           <div>Bạn đang upload ảnh có kích thước ${originSize.width}x${originSize.height}</div>
           <div>Bạn cần upload ảnh có kích thước ${minSize.width}x${minSize.height}</div>
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

export const onCreateSlim = (file: File, options: Partial<Options>): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    return createSlim(file, {
      ...options,
      instantEdit: true,
      didConfirm({ output }) {
        const canvas = output.image
        canvas.toBlob(blob => {
          resolve(blob!)
        })
      },
      didCancel() {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('CROP_CANCEL')
      },
    })
  })
}

export const validateDimension = async (
  file: File,
  {
    allowFileDimensionValidation,
    size,
    minSize,
    callbackCrop,
  }: {
    allowFileDimensionValidation: boolean
    size?: Dimension
    minSize?: Dimension
    callbackCrop?: () => Promise<void>
  }
) => {
  if (!allowFileDimensionValidation) return true

  const originSize = await getDimensionFile(file)
  let isValidMinSize = true
  let isValidSize = true

  if (minSize) {
    isValidMinSize = originSize.width >= minSize.width && originSize.height >= minSize.height
  }

  if (size) {
    isValidSize = originSize.width === size.width && originSize.height === size.height
  }

  if (!isValidMinSize && minSize) {
    await notifyInvalidMinSize(originSize, minSize)
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
