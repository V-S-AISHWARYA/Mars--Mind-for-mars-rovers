# 🔴 MarsMind

**Mission-Aware Visual Intelligence for Autonomous Mars Rovers**

> *"Don't just detect the rock. Decide what it means for the mission."*

MarsMind is a simulated planetary mission-control prototype. Most rover vision systems stop at detection: *"that's a rock."* MarsMind goes further and turns perception into a **mission-aware autonomous decision**. It asks:

1. What do I see?
2. How important is it?
3. Is it safe?
4. Does it matter to my mission?
5. What should I do next?

No hardware is required. Everything runs in the browser.

---

## ✨ Features

- **Closed-loop autonomy pipeline:** `SEE → UNDERSTAND → EVALUATE → PRIORITIZE → DECIDE → ACT → REMEMBER`
- **Multi-factor target scoring:** scientific value, mission relevance, novelty, accessibility, terrain risk, distance and energy cost
- **Transparent priority engine:** every target gets a 0–100 score from a visible, weighted formula, with no black box
- **Decision engine:** recommends one of `APPROACH`, `INVESTIGATE`, `RE-SCAN`, `AVOID` or `RE-ROUTE`, with reasons and alternatives
- **Active perception:** low-confidence detections (below 55%) trigger a re-scan from a new viewpoint before any commitment
- **Mission objectives:** Geology & Mineralogy, Biosignature Search, and Hazard & Route Survey, each with its own factor weights
- **Mars map:** the rover navigates around hazards and safe zones on a mission grid
- **Persistent mission memory:** every observation, score and decision is logged to a mission log
- **Mission control UI:** camera feed with detection boxes, gauges, radar, target list and decision panels

## 🧠 How the Decision Works

**Priority score** (clamped to 0–100):

```
score = wS·science + wR·relevance + wA·accessibility + wN·novelty
        − wRisk·terrainRisk − wDist·distanceCost − wEnergy·energyCost
```

**Decision rules** (simplified):

| Condition | Action |
|---|---|
| Confidence < 55% (not yet re-scanned) | `RE-SCAN` |
| Terrain risk ≥ 75 | `AVOID` |
| Terrain risk 55–74 and priority ≥ 55 | `RE-ROUTE` (reach it by a safer path) |
| Terrain risk 55–74 and priority < 55 | `AVOID` |
| Priority ≥ 72 | `INVESTIGATE` |
| Priority 45–71 | `APPROACH` |
| Priority < 45 | `RE-ROUTE` (find better candidates) |

The logic lives in [`lib/mars/engine.ts`](lib/mars/engine.ts).

## 🎬 Demo Scenarios

| Code | Scenario | What it demonstrates |
|---|---|---|
| SCN-01 | **High-Value Rock** | A textbook science target on safe terrain leads to `INVESTIGATE` |
| SCN-02 | **Unknown Object** | A low-confidence detection triggers active perception and a re-scan |
| SCN-03 | **Dangerous Target** | High science value competes with high terrain risk, so the rover avoids or re-routes |
| SCN-04 | **Multiple Targets** | Four candidates are scored and ranked, and the rover commits to the best one |

> Note: detections in these scenarios are simulated seed data. The project demonstrates the decision-making layer, not a trained computer-vision model.

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [lucide-react](https://lucide.dev/) icons
- pnpm

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Landing page
│   └── mission/              # Mission control route
├── components/
│   ├── marsmind/             # Mission UI (camera feed, radar, gauges, log...)
│   │   └── screens/          # Dashboard, Analysis, Decision, Mars Map, Memory
│   └── ui/                   # Base UI components
├── lib/mars/
│   ├── engine.ts             # Priority scoring + decision logic
│   ├── scenarios.ts          # The four demo scenarios
│   ├── store.tsx             # Mission state management
│   ├── pipeline.ts           # Pipeline stages
│   └── types.ts              # Shared types
└── public/mars/              # Scenario imagery
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)

### Run locally

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Install dependencies
pnpm install

# 3. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Start Mission**.

### Production build

```bash
pnpm build
pnpm start
```

## 🔭 Future Work

- Plug in a real object-detection model in place of simulated detections
- Support more mission objectives and custom weight tuning in the UI
- Add multi-rover coordination
- Persist mission memory to a database

## 📄 License

MIT license
