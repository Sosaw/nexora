# NEXORA V2 — Supabase

Cette version connecte le prototype NEXORA à la table `public.contents` du projet Supabase.

## Lancer
Ouvrez `index.html` dans un navigateur.

Pour un usage local plus fiable, lancez un petit serveur HTTP dans ce dossier, par exemple :
`python3 -m http.server 8080`
puis ouvrez `http://localhost:8080`.

## Base attendue
Table `public.contents` avec les colonnes créées dans NEXORA V1.

## Sécurité
Le navigateur utilise uniquement la Publishable key Supabase. Ne mettez jamais une Secret key/service_role dans le frontend.

## Important
Les URLs `poster_url`, `backdrop_url` et `video_url` sont optionnelles. Pour les vidéos, utilisez uniquement des contenus et des URLs pour lesquels vous avez les droits de diffusion.
