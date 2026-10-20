import { Suspense } from "react"
import { MissionShell } from "@/components/marsmind/mission-shell"

export default function MissionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MissionShell />
    </Suspense>
  )
}
