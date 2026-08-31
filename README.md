# Clopofeco - E-Commerce & Catalogue en Ligne

Clopofeco est une plateforme e-commerce moderne de type "catalogue". Elle permet aux clients de parcourir les produits, de les ajouter à un panier, et de finaliser leur commande de manière ultra-fluide directement via WhatsApp ou par Email.

Le projet inclut également un **Tableau de Bord d'Administration** complet et sécurisé pour gérer les produits, les catégories, les paramètres de la boutique et les utilisateurs.

## 🚀 Fonctionnalités Principales

### Côté Client (Public)
- **Catalogue Dynamique :** Affichage des produits avec filtrage par catégorie et recherche textuelle.
- **Panier d'Achat :** Gestion du panier côté client (sauvegardé en local).
- **Checkout sans friction :** Redirection intelligente de la commande vers WhatsApp (pré-remplie avec le détail du panier) pour simplifier les ventes.
- **Design Moderne & Responsive :** Interface épurée avec TailwindCSS, animations fluides et icônes modernes.
- **Page Contact & SEO :** Liens directs vers les réseaux et informations de contact (gérés dynamiquement depuis l'administration).

### Côté Administration (Privé)
- **Tableau de Bord :** Statistiques globales (nombre de produits, catégories, etc.).
- **Gestion des Produits (CRUD) :** Ajout, modification, suppression, gestion du stock, images et mise en avant.
- **Gestion des Catégories :** Organisation du catalogue.
- **Paramètres de la Boutique :** Configuration du numéro WhatsApp de réception des commandes, devise, nom, email, etc.
- **Gestion Multi-Rôles :** 
  - `Admin` : Gestion de la boutique (produits, catégories).
  - `SuperAdmin` : Accès total, incluant la création/suppression des autres comptes administrateurs.

---

## 🛠️ Stack Technique

### Frontend
- **Framework :** React 18 avec Vite
- **Styling :** Tailwind CSS
- **Routage :** React Router DOM v6
- **Icônes :** Lucide-React & icônes SVG customisées
- **Requêtes HTTP :** Axios

### Backend
- **Serveur :** Node.js avec Express.js
- **Base de Données :** Turso (libSQL / SQLite Edge)
- **Authentification :** JSON Web Tokens (JWT) & bcryptjs
- **Uploads d'images :** Multer
- **CORS & Proxy :** Routage proxy via `vercel.json` pour éviter les blocages réseaux stricts.

---

## 📂 Architecture du Projet

```text
sites_client/
├── frontend/             # Application React (Interface client & admin)
│   ├── public/           # Assets statiques (ex: logo)
│   ├── src/
│   │   ├── components/   # Composants réutilisables (Cartes, Boutons, Modales...)
│   │   ├── context/      # États globaux (AuthContext, CartContext)
│   │   ├── layouts/      # Structures de pages (Navbar, Footer, AdminSidebar)
│   │   ├── pages/        # Vues principales (Home, Contact, Dashboard admin...)
│   │   └── services/     # Appels à l'API (Axios)
│   ├── vercel.json       # Configuration de proxy pour le déploiement
│   └── package.json
│
├── backend/              # Serveur API Node.js / Express
│   ├── src/
│   │   ├── config/       # Configuration DB (Turso) et scripts (seed, migrate)
│   │   ├── controllers/  # Logique métier (Produits, Users, Auth...)
│   │   ├── middleware/   # Sécurité (Vérification JWT, rôles admin/superadmin)
│   │   ├── routes/       # Définition des points d'accès API (Endpoints)
│   │   └── server.js     # Point d'entrée de l'application
│   └── package.json
└── README.md
```

---

## ⚙️ Installation & Lancement en Local

### 1. Prérequis
- [Node.js](https://nodejs.org/) installé sur votre machine.
- Un compte [Turso](https://turso.tech/) pour la base de données.

### 2. Configuration du Backend

1. Ouvrez un terminal dans le dossier `backend` :
   ```bash
   cd backend
   npm install
   ```
2. Créez un fichier `.env` à la racine du dossier `backend` avec vos variables (voir section *Variables d'Environnement*).
3. Initialisez la base de données (Migrations & Seed) :
   ```bash
   npm run migrate
   npm run seed
   ```
   *Note: Le script seed crée automatiquement un compte `superadmin` avec l'email `admin@catalogue.com` et le mot de passe défini dans votre `.env`.*
4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
   *(Le serveur écoutera sur http://localhost:5000)*

### 3. Configuration du Frontend

1. Ouvrez un terminal dans le dossier `frontend` :
   ```bash
   cd frontend
   npm install
   ```
2. Lancez l'application React :
   ```bash
   npm run dev
   ```
   *(L'application sera accessible sur http://localhost:5173)*

---

## 🔐 Variables d'Environnement (.env)

**Backend (`backend/.env`) :**
```env
PORT=5000
# Connexion à la base de données Turso
TURSO_DATABASE_URL="libsql://votre-bdd-turso.turso.io"
TURSO_AUTH_TOKEN="votre_token_secret_turso"

# Sécurité
JWT_SECRET="une_chaine_secrete_tres_longue"
ADMIN_PASSWORD="MotDePasseSuperAdmin2024!"
```

**Frontend (`frontend/.env`) :**
*(Aucune variable stricte requise en développement local, Axios cible `/api` qui est intercepté par le proxy de développement Vite vers localhost:5000)*

---

## 🚀 Déploiement (Vercel)

Ce projet est conçu pour être déployé facilement sur **Vercel**.

1. Connectez votre dépôt GitHub à Vercel.
2. Créez **deux projets distincts** sur Vercel :
   - Un projet pour le `backend` (Dossier source : `backend`). Ajoutez-y toutes les variables d'environnement (`TURSO_DATABASE_URL`, `JWT_SECRET`, etc.).
   - Un projet pour le `frontend` (Dossier source : `frontend`). 
3. Le fichier `frontend/vercel.json` gère automatiquement la redirection des requêtes API (`/api/*`) vers l'URL de votre backend déployé, évitant ainsi les erreurs CORS et les problèmes de timeouts de certains fournisseurs d'accès internet.

---

## 👨‍💻 Créé pour
**Clopofeco** - L'excellence à votre portée.
