# Terra · logo Orbit

Une planète (terra) entourée d'une orbite qui monte à 30°. L'orbite passe derrière la planète en haut et devant en bas, puis se termine par un point de donnée. Tout est dessiné avec un seul trait arrondi et régulier.

## Fichiers

| Fichier                   | Usage                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `terra-symbol*.svg`       | Symbole seul (avatar, favicon, petits espaces)                                                       |
| `terra-symbol-small*.svg` | Version petite taille, trait plus épais, sous 32 px                                                  |
| `terra-horizontal*.svg`   | Version principale (header du site, README, docs)                                                    |
| `terra-stacked*.svg`      | Espaces carrés (slides, réseaux sociaux, goodies)                                                    |
| `terra-wordmark*.svg`     | Le nom seul, quand le symbole est déjà visible à côté                                                |
| `exports/`                | Noir, blanc, une couleur, carré, favicon, icône d'app, PNG 1200 px                                   |
| `web/`                    | `favicon.ico`, PNG 16 à 512, `apple-touch-icon`, `maskable`, `site.webmanifest`, `head-snippet.html` |

Suffixes : sans suffixe = noir, `-forest` = fond clair, `-lime` = fond sombre (symbole lime, nom clair).

Tous les maîtres sont des contours vectoriels purs : ni texte, ni trait, ni masque, ni dégradé.

## Couleurs

| Nom          | HEX       | RGB         | Rôle                                                                  |
| ------------ | --------- | ----------- | --------------------------------------------------------------------- |
| Terra Lime   | `#9BE15D` | 155 225 93  | Symbole sur fond sombre, accents (11,7:1 sur Night)                   |
| Terra Night  | `#0E1512` | 14 21 18    | Tuile de l'icône d'app, fonds sombres                                 |
| Terra Forest | `#1F6B3A` | 31 107 58   | Logo sur fond clair, liens (contraste 6,5:1 sur blanc, 6:1 sur Paper) |
| Terra Paper  | `#F4F6F1` | 244 246 241 | Nom sur fond sombre, fonds clairs                                     |

Le lime n'est jamais utilisé pour du texte sur fond clair : son contraste sur blanc n'est que de 1,6:1.

## Zone de protection

Garder autour du logo un espace vide au moins égal au rayon de la planète, soit environ un quart de la hauteur du symbole.

## Tailles minimales

- Symbole : 16 px, avec `terra-symbol-small` sous 32 px.
- Logo horizontal : 96 px de large.
- Logo empilé : 64 px de large.

## Fonds autorisés

- Forest sur Paper ou sur blanc.
- Lime et Paper sur Night ou sur tout fond sombre.
- Noir ou blanc en une couleur, si l'impression l'impose.

## À ne pas faire

- Changer l'angle de l'orbite ou la faire descendre.
- Supprimer les espaces de l'entrecroisement, ou refermer l'orbite devant la planète.
- Remplir la planète, ajouter ombres, contours ou dégradés.
- Recomposer le nom avec une police : utiliser le fichier `terra-wordmark`.
- Mettre le lime sur fond clair, ou le Forest sur fond sombre.

## Régénérer

Toute la géométrie vient de `../build/` (Python 3, sans dépendance) :

```bash
cd design/logo/build && python3 kit.py
```

Les réglages sont dans `kit.py` (`MAIN`, `SMALL`) : rayon de la planète, largeur de l'anneau, épaisseur du trait, espace aux croisements, taille du point.

## Reste à faire

- Recherche de marque (INPI, EUIPO, USPTO) et recherche d'image inversée avant le lancement public. Je ne peux pas garantir la disponibilité.
- Remplacer le logo et le favicon dans `apps/web`.
