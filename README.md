# 🏨 Application de Réservation

Ce projet est une application complète de réservation (ex: salles, événements, chambres), avec une interface utilisateur et administrateur, utilisant React pour le frontend, Node.js/Express pour le backend, et Firebase pour la gestion des utilisateurs et de la base de données.

---

## ✨ Fonctionnalités principales

### Utilisateur
- 📅 Sélection des créneaux via un calendrier interactif
- ✅ Visualisation des disponibilités en temps réel
- 💳 Paiement fictif simulé
- 📋 Dashboard personnel : voir mes réservations

### Administrateur
- ➕ Création et gestion de créneaux de réservation
- 👥 Gestion des utilisateurs
- 🗃️ Accès aux statistiques ou liste des réservations

---

## ⚙️ Technologies utilisées

- **Frontend** : React, Tailwind CSS (si utilisé)
- **Backend** : Node.js, Express
- **Base de données / Auth** : Firebase
- **Autres** : JWT pour l’authentification, Multer pour les fichiers, etc.

---

## 📁 Structure du projet

---
app-reservation/
│
├── backend/ # Serveur Node.js
│ ├── config/ # Configuration Firebase
│ ├── controllers/ # Logique métier (authentification, réservations)
│ ├── middlewares/ # Middlewares (auth)
│ ├── routes/ # Routes API (auth, protégées)
│ └── uploads/ # Images uploadées
│
├── frontend/ # Application React
│ └── src/
│
└── README.md # Ce fichier