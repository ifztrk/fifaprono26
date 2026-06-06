# FIFAPRONO 26 ⚽

Application de pronostics entre amis pour la **Coupe du Monde 2026**.
Chacun pronostique les scores des matchs, les qualifiés de chaque poule et le
vainqueur final ; les points se calculent automatiquement et un classement met
tout le monde en compétition.

## Fonctionnalités

- 🔐 **Connexion** par email + mot de passe (le 1er inscrit devient admin)
- 🌍 **Pays coup de cœur** demandé à la première connexion (drapeau affiché dans le classement)
- ⚽ **Pronostics de scores** verrouillés automatiquement au coup d'envoi de chaque match
- 📊 **Qualifiés de poule** : classements de groupe calculés en direct + pronostic 1er/2e
- 🏆 **Vainqueur final + finaliste** (pronostic avant le tournoi)
- 🥇 **Classement temps réel** avec scores exacts et drapeaux
- 👤 **Profil** avec stats et badges
- 🛠️ **Panneau admin** pour saisir les résultats (recalcul automatique des points)

### Barème

| Pronostic | Points |
|---|---|
| Score exact | **3 pts** |
| Bon résultat (V/N/D) | **1 pt** |
| Équipe correctement qualifiée d'une poule | **2 pts** (× équipe) |
| Bon vainqueur de la Coupe | **10 pts** |
| Bon finaliste | **5 pts** |

Option admin : **doubler les points** en phase à élimination directe.

## Stack technique

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Prisma 6** + **PostgreSQL**
- Auth maison (JWT via `jose` + `bcryptjs`)
- Déploiement **Vercel**

## Développement local

```bash
npm install
# Renseigner DATABASE_URL, DIRECT_URL et AUTH_SECRET dans .env
npx prisma migrate dev      # crée les tables
npm run seed                # charge les 48 équipes + le calendrier
npm run dev                 # http://localhost:3000
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | Chaîne de connexion Postgres |
| `DIRECT_URL` | Connexion directe (identique à DATABASE_URL si pas de pooling) |
| `AUTH_SECRET` | Secret aléatoire pour signer les sessions (`openssl rand -base64 48`) |

## Déploiement sur Vercel

1. `vercel login` puis `vercel link`
2. Provisionner une base Postgres (Vercel Storage → Neon, ou Prisma Postgres)
3. Ajouter `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` dans les variables d'environnement Vercel
4. `vercel --prod` — le build applique les migrations (`prisma migrate deploy`) automatiquement
5. Lancer le seed une fois : `npm run seed` (avec `DATABASE_URL` pointant sur la prod)

Le premier compte créé est automatiquement **administrateur**.
