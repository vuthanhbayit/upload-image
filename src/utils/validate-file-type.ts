// @ts-ignore
import MessageBox from 'element-ui/packages/message-box'
import imageCompression from 'browser-image-compression'
import { getExtensionFromFilename, getFileType } from './file-type'
import { isValidMimeType } from './mime-type'

export const confirmValidateExtensions = (file: File, acceptedFileTypes: string[], allowConvertFileType: boolean) => {
  try {
    return MessageBox.confirm(
      `<div>
           <div>Bạn đang upload ảnh có định dạng  ${getExtensionFromFilename(file.name)}</div>
           <div>Bạn cần upload những ảnh có định dạng như: ${acceptedFileTypes.join(', ')}</div>
      </div>`,
      'Cảnh báo',
      {
        showConfirmButton: allowConvertFileType,
        confirmButtonText: 'Auto convert',
        cancelButtonText: 'Upload lại',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
  } catch {
    return false
  }
}

export const onConvertFileType = async (file: File, type: string): Promise<File> => {
  return await imageCompression(file, { fileType: type })
}

export const validateFileType = async (
  file: File,
  {
    allowFileTypeValidation,
    allowConvertFileType,
    acceptedFileTypes,
    callbackConvertFileType,
  }: {
    allowFileTypeValidation: boolean
    allowConvertFileType: boolean
    acceptedFileTypes: string[]
    callbackConvertFileType?: () => Promise<void>
  }
) => {
  if (!allowFileTypeValidation) return true
  if (acceptedFileTypes.length === 0) return true

  const fileType = getFileType(file)

  const isValid = isValidMimeType(acceptedFileTypes, fileType)

  if (!isValid) {
    const isConfirm = await confirmValidateExtensions(file, acceptedFileTypes, allowConvertFileType)

    if (!isConfirm || !callbackConvertFileType) {
      // eslint-disable-next-line no-throw-literal
      throw 'INVALID_FILE_TYPE'
    } else {
      await callbackConvertFileType()

      return true
    }
  }

  return true
}
