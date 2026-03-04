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
      <CineConnectNavbar />

      <CommunauteSection
        membresCount={utilisateurs.length}
        abonnementsCount={utilisateurs.filter((u) => u.estSuivi).length}
        abonnesCount={utilisateurs.filter((u) => u.estSuivi).length}
        onSearch={(q) => setRecherche(q)}
        onFilterChange={(f) => setTri(f)}
      />

      <div style={{ padding: "0 2rem 2rem" }}>

        {chargement && (
          <p style={{ color: "#888", textAlign: "center", paddingTop: "2rem" }}>
            Chargement...
          </p>
        )}

        {erreur && (
          <p style={{ color: "#e50914", textAlign: "center", paddingTop: "2rem" }}>
            {erreur}
          </p>
        )}

        {!chargement && !erreur && utilisateursFiltres.map((u) => (
          <div key={u.id} style={{ marginBottom: "1rem" }}>
            <UserProfileCard user={u} />
          </div>
        ))}

        {!chargement && !erreur && utilisateursFiltres.length === 0 && (
          <p style={{ color: "#888", textAlign: "center", paddingTop: "2rem" }}>
            Aucun membre trouvé pour "{recherche}"
          </p>
        )}

      </div>
    </div>
  );
};

export default CommunautePage;
