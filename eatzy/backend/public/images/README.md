# Images pour Eatzy

Ce dossier contient les images utilisées par l'application Eatzy.

## Structure des images

### Restaurants
- `pizza-restaurant.jpg` - Image du restaurant Pizza Time
- `gourmet-restaurant.jpg` - Image du restaurant Le Gourmet
- `sushi-restaurant.jpg` - Image du restaurant Sushi World

### Plats
- `pizza-margherita.jpg` - Pizza Margherita
- `pizza-4fromages.jpg` - Pizza 4 Fromages
- `pizza-pepperoni.jpg` - Pizza Pepperoni
- `steak-poivre.jpg` - Steak au Poivre
- `saumon-grille.jpg` - Saumon Grillé
- `risotto.jpg` - Risotto aux Champignons
- `sushi-mix.jpg` - Sushi Mix
- `sashimi.jpg` - Sashimi Deluxe
- `california-roll.jpg` - California Roll

## Comment ajouter des images

1. Placez vos images dans ce dossier (`backend/public/images/`)
2. Les images seront accessibles via `http://localhost:3000/images/nom-image.jpg`
3. Mettez à jour les chemins dans `backend/server.js` si nécessaire

## Formats recommandés

- Format : JPG ou PNG
- Taille recommandée pour les restaurants : 800x600px
- Taille recommandée pour les plats : 400x300px
- Poids : < 500KB par image pour un chargement optimal

## Note

Si une image n'est pas trouvée, l'application affichera automatiquement un placeholder.
