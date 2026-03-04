import { useState, useEffect } from "react";
import CineConnectNavbar from "../components/ui/Navbar";
import CommunauteSection from "../components/ui/CommunauteSection";
import { UserProfileCard } from "../components/ui/ProfileCard1";

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

const CommunautePage = () => {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [tri, setTri] = useState("Plus populaires");

  const toggleSuivi = (id: number) => {
    setUtilisateurs(utilisateurs.map((u) =>
      u.id === id ? { ...u, estSuivi: !u.estSuivi } : u
    ));
  };

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
        setErreur("Impossible de charger les membres.");
        setChargement(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: "#0d0d0d", minHeight: "100vh", color: "white" }}>

      {/* NavBar collée en haut */}
      <CineConnectNavbar />

      {/* Section stats + recherche */}
      <CommunauteSection
        membresCount={utilisateurs.length}
        abonnementsCount={utilisateurs.filter((u) => u.estSuivi).length}
        abonnesCount={utilisateurs.filter((u) => u.estSuivi).length}
        onSearch={(q) => setRecherche(q)}
        onFilterChange={(f) => setTri(f)}
      />

      {/* Liste des cartes membres */}
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

        {erreur && (
          <p style={{ color: "#e50914", textAlign: "center", paddingTop: "3rem" }}>
            {erreur}
          </p>
        )}

        {!chargement && !erreur && utilisateursFiltres.map((u) => (
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

        {!chargement && !erreur && utilisateursFiltres.length === 0 && (
          <p style={{ color: "#888", textAlign: "center", paddingTop: "3rem" }}>
            Aucun membre trouvé pour "{recherche}"
          </p>
        )}

      </div>
    </div>
  );
};

export default CommunautePage;
