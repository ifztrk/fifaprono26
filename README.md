<h1 align="center">FIFAPRONO 26 ⚽🏆</h1>

<p align="center">
  Application web de <b>pronostics de la Coupe du Monde 2026</b> à faire entre amis :<br>
  chacun devine les scores, les points se calculent tout seuls, et un classement se met à jour en direct 💬
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
</p>

> 🎓 Projet de 1re année de Bachelor · IPSSI — Inès Ozturk

---

## 📱 Aperçu de l'application

<p align="center">
  <img src="assets/screenshots/classement.png" width="31%" alt="Écran Classement">
  &nbsp;&nbsp;
  <img src="assets/screenshots/matchs.png" width="31%" alt="Écran Matchs">
  &nbsp;&nbsp;
  <img src="assets/screenshots/disfootons.png" width="31%" alt="Écran Disfootons">
</p>

<p align="center"><i>🥇 Classement &nbsp;·&nbsp; ⚽ Matchs &amp; pronostics &nbsp;·&nbsp; 💬 Disfootons (le chat)</i></p>

---

## ✨ Fonctionnalités

- 🎯 **Pronostics** des matchs, des qualifiés de poule et du vainqueur final
- 🏆 **Calcul automatique des points**, avec un barème renforcé en phase finale
- 🥇 **Classement en direct** (podium + rangs)
- 💬 **Chat entre joueurs** (mentions, réactions, réponses)
- 🔔 **Notifications** et **installation sur mobile** (PWA)
- 🛠️ **Espace administrateur** pour saisir les scores et gérer les joueurs

## 🎯 Le barème des points

Chaque pronostic est comparé au résultat réel, les points sont attribués, puis **tout le classement est recalculé automatiquement**. Les grands matchs rapportent plus :

| Phase | 🎯 Score exact | ✅ Bon résultat |
|:--|:--:|:--:|
| Poules & 16es | 3 | 1 |
| 8es de finale | 6 | 2 |
| Quarts | 8 | 4 |
| Demies & petite finale | 12 | 6 |
| **Finale** | **20** | **10** |

## 🧱 Technologies

| Outil | Rôle |
|:--|:--|
| **Next.js / React** | Les pages et l'interface |
| **Prisma + PostgreSQL** | La base de données (hébergée sur Neon) |
| **Tailwind CSS** | La mise en forme (mode clair / sombre) |
| **Vercel** | L'hébergement et la mise en ligne |

## 🚀 Lancer le projet en local

```bash
npm install
npm run dev
```

> L'application a besoin de quelques variables d'environnement (base de données, etc.) dans un fichier `.env`, non inclus dans le dépôt pour des raisons de sécurité.

---

<p align="center"><sub>Projet réalisé dans le cadre de ma 1re année de Bachelor à l'IPSSI 💚</sub></p>
