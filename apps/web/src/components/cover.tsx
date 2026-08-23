import { COVERS } from '../svgs/covers'

export function Cover({ id, large }: { id: number; large?: boolean }) {
  const { bg, ink, Motif } = COVERS[id % COVERS.length]
  const size = large ? { width: 100, height: 62 } : { width: 62, height: 39 }
  return (
    <div className="cover" style={{ background: bg }} aria-hidden="true">
      <Motif ink={ink} style={size} />
    </div>
  )
}
