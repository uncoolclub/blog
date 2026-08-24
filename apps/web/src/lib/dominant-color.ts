const SIZE = 32

const MIN_CHROMA = 24
const MAX_LEVEL = 240
const MIN_LEVEL = 32

export async function dominantColor(url: string): Promise<string | null> {
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    await img.decode()

    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, SIZE, SIZE)

    const { data } = ctx.getImageData(0, 0, SIZE, SIZE)
    const buckets = new Map<number, [n: number, r: number, g: number, b: number]>()

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      if (data[i + 3] < 128) continue

      const max = Math.max(r, g, b)
      if (max - Math.min(r, g, b) < MIN_CHROMA) continue
      if (max > MAX_LEVEL || max < MIN_LEVEL) continue

      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
      const bucket = buckets.get(key)
      if (bucket) {
        bucket[0]++
        bucket[1] += r
        bucket[2] += g
        bucket[3] += b
      } else {
        buckets.set(key, [1, r, g, b])
      }
    }

    let best: [number, number, number, number] | undefined
    for (const bucket of buckets.values()) {
      if (!best || bucket[0] > best[0]) best = bucket
    }
    if (!best) return null

    const channel = (sum: number) =>
      Math.round(sum / best![0])
        .toString(16)
        .padStart(2, '0')
    return `#${channel(best[1])}${channel(best[2])}${channel(best[3])}`
  } catch {
    return null
  }
}
