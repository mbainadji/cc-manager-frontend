# CC Manager : interface

Interface React (Vite, Tailwind v4) de gestion des examens de contrôle continu. Nécessite l'API `cc-manager-backend`.

## Lancer en local
```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:3000/api
npm run dev              # http://localhost:5173
```
Relancer `npm run dev` après toute modification du `.env`.

## Écrans
- Public : `/` (connexion étudiant), `/inscription`, `/professeur`
- Étudiant : `/resultats`, `/resultats/:id`
- Professeur : `/tableau-de-bord`, `/examens`, `/examens/nouveau`, `/examens/:id/notes`, `/examens/:id/resultats`, `/etudiants`, `/resultats-publies`

## Reste à faire
Exports PDF et Excel, pages « Mot de passe oublié » et « Profil », modifier/supprimer un examen, vérification mobile, déploiement.

## Contribuer
Ne pas pousser sur `main`.
```bash
git checkout -b feature/nom-de-la-fonctionnalite
git add . && git commit -m "feat: description"
git push -u origin feature/nom-de-la-fonctionnalite
```
Puis ouvrir une Pull Request vers `main`.
