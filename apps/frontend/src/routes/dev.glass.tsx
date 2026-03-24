import * as React from "react"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { Play } from "lucide-react"

import {
  GlassPanel,
  PillTag,
  PosterCard,
  PrimaryButton,
  ProgressBar,
  ToggleRow,
} from "@/components/glass"

export const Route = createFileRoute("/dev/glass")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw redirect({ to: "/" })
    }
  },
  component: DevGlassPrimitivesPage,
})

/** Dev-only showcase for glass primitives (CinéConnectPlan §3). */
function DevGlassPrimitivesPage() {
  const [watchlist, setWatchlist] = React.useState(true)
  const [autoplay, setAutoplay] = React.useState(false)

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Dev only · Glass v2 primitives
        </p>
        <h1 className="text-2xl font-semibold text-ink">Component preview</h1>
        <Link to="/" className="text-sm text-accent-red hover:text-accent-red-hover">
          ← Retour à l’accueil
        </Link>
      </div>

      <GlassPanel className="space-y-4">
        <h2 className="text-lg font-medium text-ink">PillTag</h2>
        <div className="flex flex-wrap gap-2">
          <PillTag>PG-13</PillTag>
          <PillTag variant="muted">2h 14m</PillTag>
          <PillTag variant="accent">Top 10</PillTag>
        </div>
      </GlassPanel>

      <GlassPanel className="flex flex-wrap items-center gap-4">
        <PrimaryButton icon={<Play className="fill-current" aria-hidden />}>
          Regarder
        </PrimaryButton>
        <PrimaryButton disabled>Indisponible</PrimaryButton>
      </GlassPanel>

      <div>
        <h2 className="mb-3 text-lg font-medium text-ink">PosterCard</h2>
        <div className="flex flex-wrap gap-4">
          <PosterCard
            className="max-w-[200px]"
            title="Example film"
            posterPath="https://picsum.photos/seed/glass1/342/513"
            year={2024}
            rating={8.2}
          />
          <PosterCard
            className="max-w-[200px]"
            title="Interactive tile"
            posterPath="https://picsum.photos/seed/glass2/342/513"
            year={2023}
            onClick={() => {}}
          />
        </div>
      </div>

      <GlassPanel>
        <h2 className="mb-2 text-lg font-medium text-ink">Continue watching (stub)</h2>
        <p className="mb-3 text-sm text-ink-secondary">ProgressBar à 62&nbsp;%</p>
        <ProgressBar value={62} />
      </GlassPanel>

      <GlassPanel>
        <ToggleRow
          label="Ma liste"
          description="Synchroniser avec votre profil"
          checked={watchlist}
          onCheckedChange={setWatchlist}
        />
        <ToggleRow
          label="Lecture automatique"
          checked={autoplay}
          onCheckedChange={setAutoplay}
        />
      </GlassPanel>
    </div>
  )
}
