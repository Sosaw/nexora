# NEXORA V4 — Interface Premium

Refonte visuelle du prototype NEXORA V3 : interface streaming plus cinématique, hero dynamique, navigation premium, cartes horizontales, recherche compacte, modales retravaillées et espace compte conservé.

## Installation
1. Ouvrir `index.html` ou utiliser le projet Vercel/GitHub existant.
2. `app.js` contient l'URL Supabase et la clé publishable déjà utilisées par NEXORA.
3. Ne jamais mettre une clé `service_role` ou secrète dans le navigateur.

## Contenu
La page utilise la table Supabase `public.contents`. Les champs `poster_url` et `backdrop_url` permettent d'afficher de vrais visuels. Sans image, NEXORA utilise des fonds cinématiques de secours.

## Prochaine étape
Après validation de l'interface V4 : page détail complète, lecteur vidéo intégré, Ma liste synchronisée au compte, historique et recommandations.


## V4.14 — Fiches contenu & casting
- Survol d’une carte : petite description du contenu.
- Clic sur une carte : fiche dédiée NEXORA avec description, date de sortie, casting et bande-annonce TMDB en petit lecteur automatique muet.
- Clic sur un membre du casting : fiche acteur avec biographie et films/séries associés.
- Les données détaillées TMDB passent par l’Edge Function `nexora-tmdb-details`; la clé TMDB reste côté serveur.
