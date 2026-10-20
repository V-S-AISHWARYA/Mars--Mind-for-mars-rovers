import { cn } from "@/lib/utils"

export function MarsMindMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-8 w-8", className)} role="img" aria-label="MarsMind">
      <defs>
        <radialGradient id="mm-planet" cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="oklch(0.78 0.15 55)" />
          <stop offset="60%" stopColor="oklch(0.6 0.17 40)" />
          <stop offset="100%" stopColor="oklch(0.4 0.13 35)" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="11" fill="url(#mm-planet)" />
      <circle cx="19" cy="20" r="2.4" fill="oklch(0.42 0.1 35)" opacity="0.7" />
      <circle cx="28" cy="27" r="1.6" fill="oklch(0.42 0.1 35)" opacity="0.6" />
      <ellipse
        cx="24"
        cy="24"
        rx="20"
        ry="8"
        fill="none"
        stroke="oklch(0.78 0.12 205)"
        strokeWidth="1.4"
        transform="rotate(-28 24 24)"
        opacity="0.85"
      />
      <circle cx="41.5" cy="15.5" r="2" fill="oklch(0.78 0.12 205)" />
    </svg>
  )
}

export function MarsMindWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <MarsMindMark />
      <span className="font-mono text-lg font-bold tracking-[0.18em] text-foreground">
        MARS<span className="text-mars">MIND</span>
      </span>
    </div>
  )
}
