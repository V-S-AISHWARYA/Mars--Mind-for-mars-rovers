"use client"

import { useEffect, useRef } from "react"
import { useMission } from "@/lib/mars/store"
import { Panel } from "../panel"
import { TargetList } from "../target-list"

const ACTION_HEX: Record<string, string> = {
  INVESTIGATE: "#4ade80",
  APPROACH: "#38bdf8",
  "RE-SCAN": "#fbbf24",
  "RE-ROUTE": "#fbbf24",
  AVOID: "#f87171",
}

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function MarsMapScreen() {
  const mission = useMission()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const animPos = useRef({ ...mission.rover.pos })
  const dataRef = useRef(mission)
  dataRef.current = mission

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const draw = () => {
      const m = dataRef.current
      const scenario = m.scenario
      if (!scenario) {
        raf = requestAnimationFrame(draw)
        return
      }
      const W = canvas.width
      const H = canvas.height
      const toX = (x: number) => (x / 100) * W
      const toY = (y: number) => (y / 100) * H

      // ease rover toward target position
      animPos.current.x += (m.rover.pos.x - animPos.current.x) * 0.08
      animPos.current.y += (m.rover.pos.y - animPos.current.y) * 0.08

      // terrain base
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, "#3a1c12")
      g.addColorStop(0.5, "#2c150e")
      g.addColorStop(1, "#20100b")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // seeded craters / texture
      const rnd = hash(scenario.id)
      ctx.save()
      for (let i = 0; i < 42; i++) {
        const x = rnd() * W
        const y = rnd() * H
        const r = (6 + rnd() * 34) * dpr
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,0,0,${0.04 + rnd() * 0.06})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.85, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,180,120,${0.02 + rnd() * 0.03})`
        ctx.fill()
      }
      ctx.restore()

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.05)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath()
        ctx.moveTo((W / 10) * i, 0)
        ctx.lineTo((W / 10) * i, H)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, (H / 10) * i)
        ctx.lineTo(W, (H / 10) * i)
        ctx.stroke()
      }

      // safe zones
      scenario.safeZones.forEach((z) => {
        ctx.beginPath()
        ctx.arc(toX(z.x), toY(z.y), (z.r / 100) * W, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(74,222,128,0.08)"
        ctx.fill()
        ctx.strokeStyle = "rgba(74,222,128,0.4)"
        ctx.setLineDash([6, 6])
        ctx.lineWidth = 1.5 * dpr
        ctx.stroke()
        ctx.setLineDash([])
      })

      // hazards
      scenario.hazards.forEach((z) => {
        ctx.beginPath()
        ctx.arc(toX(z.x), toY(z.y), (z.r / 100) * W, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(248,113,113,0.1)"
        ctx.fill()
        ctx.strokeStyle = "rgba(248,113,113,0.55)"
        ctx.setLineDash([4, 4])
        ctx.lineWidth = 1.5 * dpr
        ctx.stroke()
        ctx.setLineDash([])
      })

      // explored trail
      const trail = [scenario.roverStart, ...[...m.events].reverse().map((e) => e.roverPos), animPos.current]
      ctx.beginPath()
      trail.forEach((p, i) => {
        const x = toX(p.x)
        const y = toY(p.y)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = "rgba(255,255,255,0.25)"
      ctx.lineWidth = 1.5 * dpr
      ctx.stroke()

      // planned route to selected (if unhandled)
      const sel = m.selectedTarget
      if (sel && !m.handledIds.includes(sel.id)) {
        ctx.beginPath()
        ctx.moveTo(toX(animPos.current.x), toY(animPos.current.y))
        ctx.lineTo(toX(sel.mapPos.x), toY(sel.mapPos.y))
        ctx.strokeStyle = "rgba(230,120,60,0.8)"
        ctx.setLineDash([8, 6])
        ctx.lineWidth = 2 * dpr
        ctx.stroke()
        ctx.setLineDash([])
      }

      // targets
      m.targets.forEach((t) => {
        const x = toX(t.mapPos.x)
        const y = toY(t.mapPos.y)
        const color = ACTION_HEX[t.decision.action] ?? "#38bdf8"
        const selected = t.id === m.selectedId
        const handled = m.handledIds.includes(t.id)
        const R = 7 * dpr

        ctx.beginPath()
        ctx.arc(x, y, R, 0, Math.PI * 2)
        ctx.fillStyle = handled ? "rgba(120,120,120,0.5)" : color
        ctx.fill()
        if (selected) {
          ctx.beginPath()
          ctx.arc(x, y, R + 5 * dpr, 0, Math.PI * 2)
          ctx.strokeStyle = "#e6783c"
          ctx.lineWidth = 2 * dpr
          ctx.stroke()
        }
        // label
        ctx.fillStyle = "rgba(255,255,255,0.9)"
        ctx.font = `${10 * dpr}px ui-monospace, monospace`
        ctx.textAlign = "center"
        ctx.fillText(`${t.id} · ${t.priorityScore}`, x, y - R - 6 * dpr)
      })

      // rover
      const rx = toX(animPos.current.x)
      const ry = toY(animPos.current.y)
      const pulse = 1 + Math.sin(Date.now() / 400) * 0.15
      ctx.beginPath()
      ctx.arc(rx, ry, 14 * dpr * pulse, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(230,120,60,0.15)"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(rx, ry, 8 * dpr, 0, Math.PI * 2)
      ctx.fillStyle = "#e6783c"
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 1.5 * dpr
      ctx.stroke()
      // heading tick
      const hr = (m.rover.heading * Math.PI) / 180
      ctx.beginPath()
      ctx.moveTo(rx, ry)
      ctx.lineTo(rx + Math.cos(hr) * 16 * dpr, ry + Math.sin(hr) * 16 * dpr)
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2 * dpr
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Panel title="Mars Mission Map" subtitle="Simulated terrain · rover moves on action execution" bodyClassName="p-3">
          <div ref={wrapRef} className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border">
            <canvas ref={canvasRef} className="absolute inset-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <Legend color="#e6783c" label="Rover" />
            <Legend color="#4ade80" label="Investigate / Safe zone" />
            <Legend color="#38bdf8" label="Approach target" />
            <Legend color="#fbbf24" label="Re-scan / Re-route" />
            <Legend color="#f87171" label="Avoid / Hazard" />
          </div>
        </Panel>
      </div>
      <div className="space-y-4">
        <Panel title="Targets on Map">
          <TargetList />
        </Panel>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
