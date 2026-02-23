// Page d'inscription de CinéConnect
// Étape 1 : Structure de base + layout 2 colonnes

import { createFileRoute } from '@tanstack/react-router'
import styles from './RegisterPage.module.css'

export const Route = createFileRoute('/RegisterPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    // Conteneur principal : 2 colonnes côte à côte
    <div className={styles.page}>

      {/* ---- Colonne gauche : formulaire ---- */}
      <div className={styles.leftColumn}>
        <p style={{ color: '#fff' }}>Colonne gauche — formulaire (à venir)</p>
      </div>

      {/* ---- Colonne droite : panneau info ---- */}
      <div className={styles.rightColumn}>
        <p style={{ color: '#fff' }}>Colonne droite — infos (à venir)</p>
      </div>

    </div>
  )
}
