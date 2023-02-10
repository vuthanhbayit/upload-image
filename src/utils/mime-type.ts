const images = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff']
const text = ['css', 'csv', 'html', 'txt']
const map: Record<string, string> = {
  zip: 'zip|compressed',
  epub: 'application/epub+zip',
}

export const guesstimateMimeType = (extension = '') => {
  extension = extension.toLowerCase()

  if (images.includes(extension)) {
    return 'image/' + (extension === 'jpg' ? 'jpeg' : extension === 'svg' ? 'svg+xml' : extension)
  }

  if (text.includes(extension)) {
    return 'text/' + extension
  }

  return map[extension] || ''
}

export const mimeTypeMatchesWildCard = (mimeType: string, wildcard: string) => {
  const mimeTypeGroup = (/^[^/]+/.exec(mimeType) || []).pop() // image/png -> image
  const wildcardGroup = wildcard.slice(0, -2) // image/* -> image
  return mimeTypeGroup === wildcardGroup
}

export const isValidMimeType = (acceptedTypes: string[], type: string) => {
  return acceptedTypes.some(acceptedType => {
    if (/\*$/.test(acceptedType)) {
      return mimeTypeMatchesWildCard(type, acceptedType)
    }

    return acceptedType === type
  })
}
