// @ts-ignore
import MessageBox from 'element-ui/packages/message-box'
import { bytesToSize } from './index'

// eslint-disable-next-line require-await
export const confirmCompress = async (size: number, maxFileSize: number, allowCompress: boolean) => {
  try {
    return MessageBox.confirm(
      `<div>
           <div>Bạn đang upload ảnh có kích thước ${bytesToSize(size)}</div>
           <div>Bạn cần upload ảnh có kích thước ${bytesToSize(maxFileSize)}</div>
      </div>`,
      'Cảnh báo',
      {
        showConfirmButton: allowCompress,
        confirmButtonText: 'Nén ảnh này',
        cancelButtonText: 'Upload ảnh khác',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
  } catch {
    return false
  }
}

export const validateFileSize = async (
  file: File,
  {
    allowCompress,
    allowFileSize,
    maxFileSize,
    callbackCompress,
  }: { allowCompress: boolean; allowFileSize: boolean; maxFileSize: number; callbackCompress?: () => Promise<void> }
) => {
  if (!allowFileSize) return true
  if (file.size <= maxFileSize) return true

  const isConfirm = await confirmCompress(file.size, maxFileSize, allowCompress)

  if (!isConfirm || !callbackCompress) {
    // eslint-disable-next-line no-throw-literal
    throw 'INVALID_FILE_SIZE'
  } else {
    await callbackCompress()
  }
}
