import type { ReactNode } from "react"
import { MissionProvider } from "@/lib/mars/store"

export default function MissionLayout({ children }: { children: ReactNode }) {
  return <MissionProvider>{children}</MissionProvider>
}
