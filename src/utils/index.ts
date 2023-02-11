export * from './dimension'
export * from './file-type'
export * from './mime-type'
export * from './upload-file'
export * from './validate-dimension'
export * from './validate-file-size'
export * from './validate-file-type'

/**
 * Converts a size in bytes to a human-readable string representation.
 *
 * @param {number} bytes - The size in bytes.
 * @param {number} [unit=1024] - The unit used to calculate the size.
 * @returns {string} - The human-readable string representation in the format of "<value> <unit>".
 */
export const bytesToSize = (bytes: number, unit = 1024) => {
  if (bytes === 0) return '0 Byte'

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const index = Math.floor(Math.log(bytes) / Math.log(unit))
  const roundedValue = Math.round(bytes / Math.pow(unit, index))

  return `${roundedValue} ${sizes[index]}`
}
