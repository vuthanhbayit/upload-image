export const getDimensionFile = (file: File | Blob): Promise<{ width: number; height: number }> => {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      resolve({
        height: img.height,
        width: img.width,
      })
    }
    img.src = URL.createObjectURL(file)
  })
}
