import { cn } from "@/lib/utils"

interface GaugeProps {
  value: number
  max?: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  colorClass?: string
  unit?: string
  className?: string
}

/** Circular progress indicator rendered with SVG. */
export function Gauge({
  value,
  max = 100,
  size = 96,
  stroke = 8,
  label,
  sublabel,
  colorClass = "text-mars",
  unit = "",
  className,
}: GaugeProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value / max))
  const dash = c * pct

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-border"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            className={cn("transition-[stroke-dasharray] duration-700 ease-out", colorClass)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-mono text-xl font-bold tabular-nums", colorClass)}>
            {Math.round(value)}
            <span className="text-xs text-muted-foreground">{unit}</span>
          </span>
          {sublabel && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{sublabel}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  )
}

/** Thin horizontal meter for a single 0-100 factor. */
export function FactorBar({
  label,
  value,
  invert = false,
  unit = "",
}: {
  label: string
  value: number
  invert?: boolean
  unit?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  const good = invert ? 100 - pct : pct
  const color =
    good >= 66 ? "bg-safe" : good >= 40 ? "bg-warn" : "bg-danger"
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
          {Math.round(value)}
          {unit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
