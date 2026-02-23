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

        <div className="rounded-2xl bg-[#1a1a1a] p-8">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Bon retour parmi <span className="text-[#e53e3e]">8,547</span> cinéphiles
          </h2>
          <p className="mb-8 text-[#9ca3af]">
            Retrouvez vos critiques, vos films favoris et les recommandations de la communauté.
          </p>

          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e53e3e]">
              🎬
            </div>
            <div>
              <p className="font-bold text-white">+12,500 films</p>
              <p className="text-sm text-[#9ca3af]">Dans notre catalogue</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f6ad55]">
              👤
            </div>
            <div>
              <p className="font-bold text-white">+45,000 critiques</p>
              <p className="text-sm text-[#9ca3af]">Publiées par nos membres</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#1a1a1a] p-8">
          <div className="mb-4 text-yellow-400">★★★★★</div>
          <p className="mb-4 italic text-white">
            "Je retrouve chaque soir mes films préférés et les avis de la communauté. CinéConnect est indispensable !"
          </p>
          <p className="text-sm text-[#9ca3af]">— Marc, membre depuis 2023</p>
        </div>

      </div>

    </div>
  )
}
