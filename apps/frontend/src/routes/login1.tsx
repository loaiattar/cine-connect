import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login1')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-screen bg-[#0a0a0a]">

      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-12 py-10">
        <p className="text-white">Colonne gauche — formulaire (à venir)</p>
      </div>

      <div className="flex flex-1 flex-col justify-center overflow-y-auto bg-[#111111] px-12 py-10">
        <p className="text-white">Colonne droite — infos (à venir)</p>
      </div>

    </div>
  )
}
