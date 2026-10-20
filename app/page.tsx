import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Eye, Brain, Scale, ListOrdered, Compass, Rocket, Database } from "lucide-react"
import { MarsMindWordmark } from "@/components/marsmind/logo"
import { PipelineStrip } from "@/components/marsmind/pipeline"
import { SCENARIOS } from "@/lib/mars/scenarios"

const CHAIN = [
  { q: "What do I see?", icon: Eye },
  { q: "How important is it?", icon: Scale },
  { q: "Is it safe?", icon: Compass },
  { q: "Does it matter to my mission?", icon: Brain },
  { q: "What should I do next?", icon: Rocket },
]

const STEPS = [
  { icon: Eye, title: "See & Understand", body: "Rover camera imagery is run through a detection layer that classifies rocks, craters, formations, hazards and unknown objects with confidence scores." },
  { icon: Scale, title: "Evaluate", body: "Every target is scored on scientific value, mission relevance, novelty, accessibility, terrain risk and distance — not just detected." },
  { icon: ListOrdered, title: "Prioritize & Decide", body: "A transparent priority engine ranks targets 0–100 and a decision engine recommends APPROACH, INVESTIGATE, RE-SCAN, AVOID or RE-ROUTE." },
  { icon: Database, title: "Act & Remember", body: "The rover executes the action on the mission map and every observation, score and decision is written to persistent mission memory." },
]

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-60" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-mars/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-5">
        {/* Nav */}
        <nav className="flex items-center justify-between py-5">
          <MarsMindWordmark />
          <Link
            href="/mission"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Mission Control
          </Link>
        </nav>

        {/* Hero */}
        <section className="grid items-center gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="animate-rise">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-mars/40 bg-mars/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-mars">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mars" />
              Autonomous Planetary Decision System
            </div>
            <h1 className="font-mono text-5xl font-bold leading-[0.95] tracking-tight text-balance md:text-6xl">
              MARS<span className="text-mars">MIND</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground text-pretty">
              Mission-Aware Visual Intelligence for Autonomous Mars Rovers
            </p>
            <blockquote className="mt-6 border-l-2 border-mars pl-4 text-xl font-medium text-foreground text-pretty">
              &ldquo;Don&apos;t just detect the rock. Decide what it means for the mission.&rdquo;
            </blockquote>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/mission"
                className="glow-mars inline-flex items-center gap-2 rounded-md bg-mars px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                Start Mission
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/mission"
                className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 font-mono text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                View Demo Scenarios
              </Link>
            </div>

            <div className="mt-8">
              <PipelineStrip />
            </div>
          </div>

          <div className="animate-rise overflow-hidden rounded-xl border border-border">
            <div className="relative aspect-[4/3]">
              <Image
                src="/mars/scenario-high-value-rock.png"
                alt="Simulated Mars terrain viewed from a rover camera"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute inset-0 scanline opacity-30" />
              {/* mock detection box */}
              <div className="absolute left-[34%] top-[42%] h-[34%] w-[32%] rounded border-2 border-mars">
                <span className="absolute -top-6 left-0 rounded bg-mars px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground">
                  RK-07 · 94%
                </span>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-border bg-background/80 px-2.5 py-1.5 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-safe" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Priority 91 · INVESTIGATE
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Differentiator */}
        <section className="py-14">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-mars">The key differentiator</p>
          <h2 className="max-w-3xl text-2xl font-semibold text-balance md:text-3xl">
            MarsMind is not merely an object detector. It turns perception into a mission-aware autonomous decision.
          </h2>
          <div className="mt-8 flex flex-col gap-2 md:flex-row md:items-stretch">
            {CHAIN.map((c, i) => (
              <div key={c.q} className="flex flex-1 items-center gap-2">
                <div className="flex-1 rounded-lg border border-border bg-panel/70 p-4">
                  <c.icon className="mb-2 h-5 w-5 text-tech" />
                  <p className="font-mono text-sm text-foreground text-pretty">{c.q}</p>
                </div>
                {i < CHAIN.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/50 md:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.title} className="rounded-lg border border-border bg-panel/70 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-mars/40 bg-mars/10">
                  <s.icon className="h-5 w-5 text-mars" />
                </div>
                <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Scenarios */}
        <section className="py-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-mars">Demo Scenarios</p>
              <h2 className="text-2xl font-semibold">Four missions, one closed loop</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCENARIOS.map((s) => (
              <Link
                key={s.id}
                href={`/mission?scenario=${s.id}`}
                className="group overflow-hidden rounded-lg border border-border bg-panel/70 transition-colors hover:border-mars/50"
              >
                <div className="relative aspect-video">
                  <Image src={s.image} alt={s.name} fill className="object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-panel to-transparent" />
                  <span className="absolute left-2 top-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mars backdrop-blur">
                    {s.code}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">{s.name}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">{s.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-tech">
                    Run scenario <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="flex flex-col items-center gap-2 border-t border-border py-8 text-center">
          <MarsMindWordmark />
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Visual Understanding · Scientific Value · Mission Relevance · Terrain Risk · Uncertainty
          </p>
          <p className="text-xs text-muted-foreground/60">Simulated planetary mission control prototype · No hardware required</p>
        </footer>
      </div>
    </main>
  )
}
