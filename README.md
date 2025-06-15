# CampusMarket - Backend

Ce dossier contient l'architecture backend du projet CampusMarket, une marketplace pour étudiants basée sur une architecture microservices.

## Structure des dossiers

- `auth-service` : Service d'authentification (NestJS, JWT, cookies)
- `user-service` : Gestion des profils utilisateurs et messagerie interne
- `marketplace-service` : Gestion des annonces et transactions
- `api-gateway` : Point d'entrée GraphQL pour le frontend
- `common` : Librairies partagées (DTO, interfaces, etc.)

## Technologies principales
- NestJS
- MongoDB
- Kafka
- Redis
- GraphQL

## Lancement (à venir)
- Un fichier `docker-compose.yml` sera fourni pour lancer tous les services et dépendances facilement. 

# CampusMarket - Frontend

Ce projet est le frontend Angular de la marketplace CampusMarket.

## Prérequis
- Node.js >= 18 (recommandé LTS)
- npm >= 9
- Le backend (microservices NestJS + API Gateway) doit être lancé (voir dossier backend)

## Installation

1. Installe les dépendances :
   ```bash
   npm install
   ```

2. Configure l'URL de l'API GraphQL si besoin (par défaut : `http://localhost:3000/graphql`)
   - Modifie le fichier `src/app/graphql.module.ts` si tu veux changer l'URL.

## Lancement du frontend

```bash
npm start
```

L'application sera accessible sur [http://localhost:4200](http://localhost:4200)

## Fonctionnalités principales
- Authentification (connexion/inscription)
- Annonces (affichage, création)
- Messagerie interne (envoi/réception de messages)
- Profil utilisateur (affichage, modification)
- Navigation moderne avec Angular Material

## Conseils
- Pour tester la création d'annonces ou l'envoi de messages, connecte-toi ou inscris-toi d'abord.
- Le design est responsive et adapté mobile/tablette/desktop.
- Pour toute modification de l'API, adapte les services Angular dans `src/app/services/`.

## Démo rapide
- Page d'accueil : liste des annonces
- Barre latérale : navigation vers Messagerie, Profil, Déconnexion
- Messagerie : chat simple entre utilisateurs
- Profil : modification du nom et de l'avatar

---

**Bon test !** 