import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profil")({
  component: ProfilPage,
});

function ProfilPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold">Profil utilisateur</h1>
    </div>
  );
}
