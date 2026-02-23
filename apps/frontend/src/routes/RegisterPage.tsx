// Page d'inscription de CinéConnect

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/RegisterPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-screen bg-[#0a0a0a]">

      {/* ---- Colonne gauche : formulaire ---- */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-12 py-10">

        <a
          href="/"
          className="mb-8 w-fit text-sm text-gray-400 transition-colors hover:text-white"
        >
          ← Retour
        </a>

        <div className="mb-6 flex items-center gap-2 text-2xl font-bold">
          <span>🎬</span>
          <span>
            <span className="text-[#e53e3e]">Ciné</span>
            <span className="text-[#f6ad55]">Connect</span>
          </span>
        </div>

        <h1 className="mb-2 text-4xl font-bold text-white">
          Créer un compte
        </h1>

        <p className="mb-8 text-[#9ca3af]">
          Rejoignez la communauté des cinéphiles
        </p>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-white">
            Nom d'utilisateur
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">👤</span>
            <input
              type="text"
              placeholder="JohnDoe"
              className="w-full rounded-lg border border-[#374151] bg-[#1a1a1a] py-2.5 pl-10 pr-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-[#e53e3e]"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-white">
            Email
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">✉️</span>
            <input
              type="email"
              placeholder="votre@email.com"
              className="w-full rounded-lg border border-[#374151] bg-[#1a1a1a] py-2.5 pl-10 pr-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-[#e53e3e]"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-white">
            Mot de passe
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">🔒</span>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#374151] bg-[#1a1a1a] py-2.5 pl-10 pr-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-[#e53e3e]"
            />
          </div>
        </div>

      </div>

      {/* ---- Colonne droite : panneau info ---- */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto bg-[#111111] px-12 py-10">
        <p className="text-white">Colonne droite — infos (à venir)</p>
      </div>

    </div>
  )
}
