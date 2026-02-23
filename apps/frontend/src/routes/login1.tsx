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
        <p className="mb-8 text-[#9ca3af]">Bon retour parmi les cinéphiles</p>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-white">Email</label>
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
          <label className="mb-1 block text-sm font-medium text-white">Mot de passe</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">🔒</span>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#374151] bg-[#1a1a1a] py-2.5 pl-10 pr-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-[#e53e3e]"
            />
          </div>
        </div>

        <button className="mb-6 w-full rounded-lg bg-[#e53e3e] py-3 font-semibold text-white transition-colors hover:bg-[#c53030]">
          Se connecter
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#374151]" />
          <span className="text-sm text-gray-500">Ou continuer avec</span>
          <div className="h-px flex-1 bg-[#374151]" />
        </div>

        <div className="mb-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#374151] bg-[#1a1a1a] py-2.5 text-white transition-colors hover:bg-[#222]">
            <span className="font-bold">G</span>
            <span>Google</span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <a href="/RegisterPage" className="text-[#f6ad55] hover:underline">
            S'inscrire
          </a>
        </p>

      </div>

      <div className="flex flex-1 flex-col justify-center overflow-y-auto bg-[#111111] px-12 py-10">
        <p className="text-white">Colonne droite — infos (à venir)</p>
      </div>

    </div>
  )
}
