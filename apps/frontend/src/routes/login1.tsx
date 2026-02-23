import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login1')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-screen bg-[#0a0a0a]">

      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-12 py-10">

        <a href="/" className="mb-8 w-fit text-sm text-gray-400 transition-colors hover:text-white">
          ← Retour
        </a>

        <div className="mb-6 flex items-center gap-2 text-2xl font-bold">
          <span>🎬</span>
          <span>
            <span className="text-[#e53e3e]">Ciné</span>
            <span className="text-[#f6ad55]">Connect</span>
          </span>
        </div>

        <h1 className="mb-2 text-4xl font-bold text-white">Se connecter</h1>

        <p className="mb-8 text-[#9ca3af]">
          Bon retour parmi les cinéphiles
        </p>

      </div>

      <div className="flex flex-1 flex-col justify-center overflow-y-auto bg-[#111111] px-12 py-10">
        <p className="text-white">Colonne droite — infos (à venir)</p>
      </div>

    </div>
  )
}
