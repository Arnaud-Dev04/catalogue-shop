# Plan d'implémentation - Catalogue de produits

Ce document décrit le plan technique complet pour la création de la plateforme de catalogue de produits avec React (Vite + Tailwind CSS), Node.js (Express), et MySQL (compatible TiDB Cloud).

---

## User Review Required

> [!IMPORTANT]
> **Stockage des images :** Comme le backend sera hébergé sur Vercel, le stockage local sur le serveur n'est pas persistant. Nous utiliserons l'API **Cloudinary** (ou la possibilité de saisir directement des URLs d'images externes) pour l'upload d'images. L'administrateur pourra uploader des fichiers qui seront envoyés à Cloudinary, et l'API sauvegardera l'URL renvoyée dans la base de données.
> 
> **Devise et Numéro WhatsApp :** Par défaut, la devise sera le **BIF** (Franc burundais) et le numéro de WhatsApp sera configurable via la table `settings` pour éviter tout hardcoding.

---

## Open Questions

> [!NOTE]
> 1. Avez-vous déjà un compte **TiDB Cloud** et une base de données créée, ou souhaitez-vous que nous commencions par créer le schéma SQL localement sous MySQL pour vos tests ?
> 2. Pour l'upload d'images, préférez-vous utiliser **Cloudinary** (nécessite des variables d'environnement `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) ou un autre service comme **Vercel Blob** ? Si vous n'avez pas de clé de stockage, nous pouvons configurer l'upload pour utiliser une solution d'URL publique simple (ou un stockage temporaire pour démonstration).

---

## Proposed Changes

Nous allons structurer le projet en deux parties principales :
- `backend/` : Serveur Node.js/Express, API REST, JWT, connexion TiDB/MySQL avec `mysql2/promise`.
- `frontend/` : Application React avec Vite, Tailwind CSS, React Router, Lucide Icons, et Axios.

---

### 1. Base de Données (Schéma SQL)

Le schéma SQL sera créé dans un fichier `backend/src/config/schema.sql`.

```sql
-- Création des tables
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(15, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  whatsapp_number VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  currency VARCHAR(10) DEFAULT 'BIF',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 2. Architecture du Code (Backend & Frontend)

#### Backend (`backend/`)
- `src/server.js` : Point d'entrée de l'application Express.
- `src/config/db.js` : Configuration du pool de connexion MySQL avec `mysql2`.
- `src/middleware/auth.js` : Middlewares `authenticateToken` et `requireAdmin`.
- `src/controllers/` : Logique métier pour `auth`, `products`, `categories`, `orders`, `settings`.
- `src/routes/` : Définition des endpoints REST.
- `src/services/` : Service pour l'upload d'images (Cloudinary) et autres utilitaires.

#### Frontend (`frontend/`)
- `src/main.jsx` & `src/App.jsx` : Configuration de l'application et des routes.
- `src/context/AuthContext.jsx` : Contexte d'authentification de l'administrateur.
- `src/context/CartContext.jsx` : Contexte de gestion du panier avec persistance `localStorage`.
- `src/layouts/` : Layout public (`Navbar`, `Footer`) et Layout Admin.
- `src/pages/` :
  - `Home.jsx` : Section Hero, catégories, produits vedettes, contact.
  - `Products.jsx` : Recherche, filtres, tri et catalogue.
  - `ProductDetail.jsx` : Détail, galerie d'images, ajout panier, commande rapide.
  - `Cart.jsx` : Liste, modification des quantités, suppression, totaux, commande WhatsApp/Email.
  - `AdminLogin.jsx` : Page de connexion pour l'admin.
  - `AdminDashboard.jsx` : Statistiques clés (nombre de produits, valeur du stock, etc.).
  - `AdminProducts.jsx` & `AdminCategories.jsx` : Listes CRUD et formulaires d'ajout/modification.
  - `AdminSettings.jsx` : Modification des paramètres de la boutique (WhatsApp, Email, etc.).
  - `NotFound.jsx` : Page d'erreur 404.

---

### 3. API REST Endpoints

| Méthode | Endpoint | Description | Auth requise |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Connexion administrateur | Non |
| **GET** | `/api/auth/me` | Vérifier le token admin actuel | Oui |
| **GET** | `/api/products` | Récupérer tous les produits (avec filtres, tri) | Non |
| **GET** | `/api/products/:id` | Récupérer un produit par ID ou Slug | Non |
| **POST** | `/api/products` | Créer un produit | Oui |
| **PUT** | `/api/products/:id` | Modifier un produit | Oui |
| **DELETE**| `/api/products/:id` | Supprimer un produit | Oui |
| **GET** | `/api/categories` | Récupérer toutes les catégories | Non |
| **GET** | `/api/categories/:id` | Récupérer une catégorie par ID | Non |
| **POST** | `/api/categories` | Créer une catégorie | Oui |
| **PUT** | `/api/categories/:id` | Modifier une catégorie | Oui |
| **DELETE**| `/api/categories/:id` | Supprimer une catégorie | Oui |
| **POST** | `/api/orders` | Enregistrer une commande (historique) | Non |
| **GET** | `/api/orders` | Récupérer toutes les commandes | Oui |
| **GET** | `/api/orders/:id` | Récupérer une commande spécifique | Oui |
| **PUT** | `/api/orders/:id` | Modifier le statut d'une commande | Oui |
| **GET** | `/api/settings` | Récupérer les paramètres du site (WhatsApp, Email, etc.) | Non |
| **PUT** | `/api/settings` | Modifier les paramètres | Oui |

---

## Verification Plan

### Automated & Manual Verification
1. **Initialisation & Build** : Lancer l'initialisation de Vite (`npm run dev`) et du backend Express pour s'assurer que les deux serveurs tournent sans erreur.
2. **Tests d'API REST** : 
   - Utiliser un script de test local ou `curl`/`fetch` pour valider l'authentification JWT.
   - Valider que les routes publiques (`GET /api/products`, `GET /api/categories`) renvoient correctement les données de démonstration.
   - Valider que les routes d'écriture (`POST`, `PUT`, `DELETE`) renvoient bien une erreur 401/403 en l'absence de token JWT valide.
3. **Validation Fonctionnelle du Panier & WhatsApp/Email** :
   - Tester l'ajout d'un produit, la modification des quantités, la persistance dans le `localStorage`.
   - Cliquer sur "Commander sur WhatsApp" et vérifier que l'URL générée est correctement encodée et structurée comme demandé.
   - Cliquer sur "Commander par Email" et valider le format de l'e-mail ouvert (mailto:).
4. **Dashboard & CRUD Admin** :
   - Se connecter avec le compte de démo et vérifier la redirection.
   - Créer une catégorie, puis ajouter un produit associé.
   - Modifier les prix et les stocks, puis vérifier l'affichage des badges "Stock faible" et "Rupture de stock".
5. **Responsiveness** : Utiliser les outils de développement navigateur pour valider la grille responsive et le menu mobile.
