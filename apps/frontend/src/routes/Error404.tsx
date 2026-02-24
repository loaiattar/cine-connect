import { Link } from "@tanstack/react-router";

export function Error404() {
  return (
    <div>
      <h1>404</h1>
      <p>Page introuvable</p>
      <p>La page que tu cherches n'existe pas.</p>
      <Link to="/">Retour à l'accueil</Link>
    </div>
  );
}
