# Galaxy Gym Elfaouar — Dashboard

Dashboard de gestion pour salle de sport, réalisé avec **React (Vite)** et **MUI**, dans un style moderne et luxe (noir & or).

## Fonctionnalités
- Page d'authentification (connexion)
- Vue d'ensemble (statistiques générales, revenus, répartition par catégorie)
- Gestion des membres (recherche, filtres, tableau interactif)
- Gestion des entraîneurs
- Gestion du secrétariat
- Gestion des catégories (Musculation, Box, CrossFit, Yoga, Cardio, Natation)
- Gestion des abonnements (formules + liste des abonnés)

## Installation

```bash
npm install
npm run dev
```

L'application sera accessible sur http://localhost:5173

## Connexion (démo)
Sur la page de connexion, saisissez n'importe quel email et mot de passe pour accéder au dashboard (authentification simulée en front-end, à remplacer par un vrai backend).

## Build de production

```bash
npm run build
```

## Stack technique
- React 18 + Vite
- MUI (Material UI) v5 + MUI X DataGrid
- React Router v6
- Recharts (graphiques)
- Fontsource (Poppins + Playfair Display)

## Structure
```
src/
  components/    # Layout, ProtectedRoute, StatCard
  context/       # AuthContext (authentification)
  data/          # Données simulées (mockData.js) — à remplacer par vos appels API
  pages/         # Login, Dashboard, Members, Trainers, Secretary, Categories, Subscriptions
  theme.js       # Thème MUI luxe (noir & or)
```

## Personnalisation
- Couleurs : modifiez `src/theme.js`
- Données : remplacez le contenu de `src/data/mockData.js` par vos appels API
- Logo : modifiez `public/gym-icon.svg`
