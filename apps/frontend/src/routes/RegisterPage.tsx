// Page d'inscription de CinéConnect
// Stage 1 : Base structure + 2-column layout (Tailwind CSS)

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/RegisterPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    // Conteneur principal : 2 colonnes côte à côte, fond noir, pleine hauteur
    <div className="flex h-screen bg-[#0a0a0a]">

      {/* ---- Colonne gauche : formulaire ---- */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-12 py-10">
        <p className="text-white">Colonne gauche — formulaire (à venir)</p>
      </div>

      {/* ---- Colonne droite : panneau info ---- */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto bg-[#111111] px-12 py-10">
        <p className="text-white">Colonne droite — infos (à venir)</p>
      </div>

    </div>
  )
}
