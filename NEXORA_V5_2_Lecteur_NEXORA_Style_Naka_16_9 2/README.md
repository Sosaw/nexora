# NEXORA — Fiches, saisons, épisodes et recommandations

Cette version comprend :
- sélection fonctionnelle des saisons sur la fiche pleine page ;
- récupération des informations d'épisodes via la fonction Supabase `nexora-tmdb-details` lorsqu'elle expose l'action `season` ;
- titre, description, durée, date et image d'aperçu propres à chaque épisode lorsque les données sont disponibles ;
- clic sur l'image ou le bouton d'un épisode pour lancer l'épisode correspondant ;
- section « VOUS POURRIEZ AUSSI AIMER » avec cartes dans le style NEXORA et ouverture de la fiche complète du contenu associé ;
- fallback local si les données d'épisodes ne sont pas disponibles.

Après remplacement, effectuer un rechargement forcé : Cmd + Shift + R sur Mac ou Ctrl + F5 sur Windows.
