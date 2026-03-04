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
};

const CommunautePage = () => {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

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
      {chargement && <p style={{ padding: "2rem", color: "#888" }}>Chargement...</p>}
      {erreur && <p style={{ padding: "2rem", color: "#e50914" }}>{erreur}</p>}
      {!chargement && !erreur && utilisateurs.map((u) => (
        <UserProfileCard key={u.id} user={u} />
      ))}
    </div>
  );
};

export default CommunautePage;
