import { shuffle, without } from '@thinkvn/utils'
import { getNameFromFilename } from './file-type'

const BASE_URL = 'https://api.shortpixel.com/v2'

const toFormData = (data: Record<string, any>) => {
  const formData = new FormData()

  for (const key in data) {
    formData.append(key, data[key])
  }

  return formData
}

const toBlob = (url: string) => {
  return fetch(url).then(res => res.blob())
}

export const fileUpload = async (file: File, params: any): Promise<Blob | 'NOT_FOUND_KEY' | null> => {
  try {
    const key = shuffle(params.keys)[0]
    const filename = getNameFromFilename(file.name)

    const response = await fetch(BASE_URL + '/post-reducer.php', {
      method: 'POST',
      body: toFormData({
        key,
        lossy: 1,
        file_paths: JSON.stringify({ [filename]: file.name }),
        [filename]: file,
        wait: 30,
      }),
    }).then(res => res.json())

    if (response.Status) {
      if (response.Status.Code === -403) {
        const keys = without(params.keys, key)

        if (keys.length === 0) {
          return 'NOT_FOUND_KEY'
        }

        return fileUpload(file, { keys })
      }

      return null
    }

    if (!response.length) {
      return null
    }

    const lossyUrl = response[0].LossyURL.replace('http://', 'https://')

    return await toBlob(lossyUrl)
  } catch (e) {
    console.log('e', e)

    return null
  }
}

export const checkApiStatus = async (key: string): Promise<boolean> => {
  try {
    const { APICallsMade, APICallsQuota } = await fetch('https://api-qc.thinkpro.vn/cms/proxy/short-pixel/status', {
      method: 'POST',
      body: toFormData({ key }),
    }).then(res => res.json())

    return Number(APICallsMade) < Number(APICallsQuota)
  } catch (e) {
    console.log('e', e)
    return false
  }
}
