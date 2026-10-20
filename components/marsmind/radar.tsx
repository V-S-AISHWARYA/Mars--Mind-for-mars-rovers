interface Axis {
  label: string
  value: number
}

/** Lightweight SVG radar/spider chart for target factor profiles. */
export function FactorRadar({ axes, size = 220 }: { axes: Axis[]; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 34
  const n = axes.length
  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2

  const point = (i: number, r: number) => {
    const a = angleFor(i)
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  }

  const rings = [0.25, 0.5, 0.75, 1]
  const dataPts = axes.map((ax, i) => point(i, radius * (Math.max(0, Math.min(100, ax.value)) / 100)))
  const dataPath = dataPts.map((p) => p.join(",")).join(" ")

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[240px]">
      {rings.map((ring, ri) => (
        <polygon
          key={ri}
          points={axes.map((_, i) => point(i, radius * ring).join(",")).join(" ")}
          fill="none"
          stroke="var(--grid)"
          strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, radius)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--grid)" strokeWidth={1} />
      })}
      <polygon points={dataPath} fill="oklch(0.66 0.17 45 / 22%)" stroke="var(--mars)" strokeWidth={2} />
      {dataPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={2.6} fill="var(--mars)" />
      ))}
      {axes.map((ax, i) => {
        const [x, y] = point(i, radius + 16)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground font-mono"
            style={{ fontSize: 8, letterSpacing: "0.06em" }}
          >
            {ax.label}
          </text>
        )
      })}
    </svg>
  )
}
