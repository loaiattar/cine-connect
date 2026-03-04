import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import CineConnectNavbar from "../components/ui/Navbar";
import CommunauteSection from "../components/ui/CommunauteSection";
import { UserProfileCard } from "../components/ui/ProfileCard1";

export const Route = createFileRoute("/CommunautePage")({
  component: CommunautePage,
});

type Utilisateur = {
  id: number;
  username: string;
  memberSince: string;
  bio: string;
  filmCount: number;
  averageRating: number;
  reviewCount: number;
  followersCount: number;
  followingCount: number;
  estSuivi: boolean;
};

const mockUtilisateurs: Utilisateur[] = [
  {
    id: 1,
    username: "Alice Martin",
    memberSince: "janvier 2023",
    bio: "Passionnée de cinéma français et de films d'auteur.",
    filmCount: 142,
    averageRating: 4.2,
    reviewCount: 38,
    followersCount: 210,
    followingCount: 95,
    estSuivi: false,
  },
  {
    id: 2,
    username: "Tom Dubois",
    memberSince: "mars 2022",
    bio: "Fan de science-fiction et de thrillers psychologiques.",
    filmCount: 89,
    averageRating: 3.8,
    reviewCount: 21,
    followersCount: 134,
    followingCount: 60,
    estSuivi: false,
  },
  {
    id: 3,
    username: "Sara Benali",
    memberSince: "juin 2024",
    bio: "J'adore les comédies romantiques et les films d'animation.",
    filmCount: 57,
    averageRating: 4.5,
    reviewCount: 14,
    followersCount: 78,
    followingCount: 42,
    estSuivi: true,
  },
  {
    id: 4,
    username: "Karim Leroy",
    memberSince: "septembre 2021",
    bio: "Cinéphile averti, spécialiste des films noirs des années 50.",
    filmCount: 315,
    averageRating: 3.6,
    reviewCount: 102,
    followersCount: 489,
    followingCount: 180,
    estSuivi: false,
  },
];

function CommunautePage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>(mockUtilisateurs);
  const [chargement, setChargement] = useState(false);
  const [recherche, setRecherche] = useState("");

  const utilisateursFiltres = utilisateurs.filter((u) =>
    u.username.toLowerCase().includes(recherche.toLowerCase())
  );

  useEffect(() => {
    setChargement(true);
    fetch("/api/users/community")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        setUtilisateurs(data);
        setChargement(false);
      })
      .catch(() => {
        setChargement(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: "#0d0d0d", minHeight: "100vh", color: "white" }}>

      <CineConnectNavbar />

      <CommunauteSection
        membresCount={utilisateurs.length}
        abonnementsCount={utilisateurs.filter((u) => u.estSuivi).length}
        abonnesCount={utilisateurs.filter((u) => u.estSuivi).length}
        onSearch={(q) => setRecherche(q)}
        onFilterChange={() => {}}
      />

      <div style={{
        maxWidth: "860px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}>

        {chargement && (
          <p style={{ color: "#888", textAlign: "center", paddingTop: "3rem" }}>
            Chargement...
          </p>
        )}

        {!chargement && utilisateursFiltres.map((u) => (
          <div
            key={u.id}
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <UserProfileCard user={u} />
          </div>
        ))}

        {!chargement && utilisateursFiltres.length === 0 && (
          <p style={{ color: "#888", textAlign: "center", paddingTop: "3rem" }}>
            Aucun membre trouvé pour "{recherche}"
          </p>
        )}

      </div>
    </div>
  );
}

export default CommunautePage;
