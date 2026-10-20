import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function Panel({
  title,
  subtitle,
  right,
  children,
  className,
  bodyClassName,
}: {
  title?: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-panel/80 backdrop-blur-sm",
        className,
      )}
    >
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {title}
              </h2>
            )}
            {subtitle && <p className="truncate text-xs text-muted-foreground/70">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  )
}

export function StatLine({
  label,
  value,
  accent,
}: {
  label: string
  value: ReactNode
  accent?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-sm font-semibold tabular-nums", accent)}>{value}</span>
    </div>
  )
}
