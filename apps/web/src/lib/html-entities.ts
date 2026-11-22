const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

export function decodeEntities(s: string): string {
  return s.replace(
    /&(?:#(\d+)|#x([\da-f]+)|(amp|lt|gt|quot|apos|nbsp));/gi,
    (match, dec?: string, hex?: string, name?: string) => {
      if (name) return NAMED[name.toLowerCase()]
      const code = dec ? Number(dec) : Number.parseInt(hex!, 16)
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match
    },
  )
}
