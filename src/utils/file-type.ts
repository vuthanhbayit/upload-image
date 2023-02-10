import { isString } from '@thinkvn/utils'
import { guesstimateMimeType } from './mime-type'

export const getExtensionFromFilename = (name: string) => name.split('.').pop()

export const getNameFromFilename = (name: string) => name.split('.').slice(0, -1).join('-')

export const getFileType = (file: File | string): string => {
  if (isString(file)) {
    const extension = getExtensionFromFilename(file)

    return extension ? guesstimateMimeType(extension) : ''
  } else {
    return file.type
  }
}
