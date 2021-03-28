/// Bug à fixer
OK-mettre un selected sur l'option de la BD choisie 
OK-regrouper page de confirmation et home
OK-fixer bug redirection vers home après la validation
OK-modifier chemin d'import et export des tables
- Ajouter recherche de fichier/dossier dans windows pour importer ou exporter
-convertion avec 1 seule ligne de donnée dans la table (pb boucle)
-remplace les NULL par "" et inversement
-regler bug des message de validation (pb d'asynchronisme, )
-factoriser
-enlever les commentaires et console.log inutiles
-montrer infos menu on-mouse-over
-Créer un bouton de déconnexion
-regrouper le choix de la BD import/export sur 1 seule page
-séparer les champs nom du fichier et extension sur la page de choix de la table
-modifer signalisation du code pour rendre plus clair

/// Algo
ouvre la page avec liste des bd
click sur validerBD et lance la page de liste des tables et des format 
afficher liste déroulante des tables en fonction des bd
vérifier si la table est une table ou une vue
récup les infos de la table via un SELECT

click sur CONVERTIR et crée un fichier au format choisie avec les datas de la table choisie

si TXT ou CSV affiche le chox des sélecteurs .onclick
sinon non

si JSON alors afficher option formatté ou non dans le select.

erreur si les champs ne sont pas sélectionné

remplace les NULL par ""