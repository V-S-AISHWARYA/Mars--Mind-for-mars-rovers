"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"
import { SCENARIOS } from "@/lib/mars/scenarios"
import { getObjective } from "@/lib/mars/engine"
import { MarsMindWordmark } from "./logo"
import { PipelineStrip } from "./pipeline"

export function MissionBriefing({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" />
      <div className="relative mx-auto max-w-6xl px-5 py-6">
        <div className="flex items-center justify-between">
          <MarsMindWordmark />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>

        <div className="mt-10 max-w-2xl">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-mars">Mission Briefing</p>
          <h1 className="text-3xl font-semibold text-balance md:text-4xl">Select a mission scenario</h1>
          <p className="mt-3 text-muted-foreground text-pretty">
            Each scenario runs the full autonomous loop end-to-end. Pick a target field and MarsMind will see,
            evaluate, prioritize, decide and act — then log everything to mission memory.
          </p>
          <div className="mt-5">
            <PipelineStrip />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((s) => {
            const obj = getObjective(s.objectiveId)
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className="group flex overflow-hidden rounded-lg border border-border bg-panel/70 text-left transition-colors hover:border-mars/50"
              >
                <div className="relative w-32 shrink-0 sm:w-40">
                  <Image src={s.image} alt={s.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-panel/60" />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-mars/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mars">
                      {s.code}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.detections.length} target{s.detections.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-mono text-sm font-semibold uppercase tracking-wider">{s.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">{s.summary}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-tech">{obj.name}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-mars">
                      <Play className="h-3 w-3" /> Deploy
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </main>
  )
}
