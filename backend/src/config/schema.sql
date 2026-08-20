-- ============================================
-- SCHÉMA DE BASE DE DONNÉES - Catalogue Produits
-- Compatible MySQL / TiDB Cloud
-- ============================================

-- Créer la base si elle n'existe pas (à exécuter sur MySQL local uniquement)
-- CREATE DATABASE IF NOT EXISTS catalog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE catalog_db;

-- ============================================
-- TABLE : users (administrateurs)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role        VARCHAR(50) DEFAULT 'admin',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE : categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE : products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price       DECIMAL(15, 2) NOT NULL,
  stock       INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE : product_images
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT,
  image_url   VARCHAR(500) NOT NULL,
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE : orders
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  customer_name   VARCHAR(255) NOT NULL,
  customer_phone  VARCHAR(50) NOT NULL,
  customer_email  VARCHAR(255) NOT NULL,
  total           DECIMAL(15, 2) NOT NULL,
  status          VARCHAR(50) DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE : order_items
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT,
  product_id  INT,
  quantity    INT NOT NULL,
  unit_price  DECIMAL(15, 2) NOT NULL,
  subtotal    DECIMAL(15, 2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE : settings (paramètres de la boutique)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  business_name   VARCHAR(255) NOT NULL,
  logo_url        VARCHAR(500),
  whatsapp_number VARCHAR(50) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(50),
  address         TEXT,
  currency        VARCHAR(10) DEFAULT 'BIF',
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- INDEX pour les performances
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active   ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_slug      ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_images_prod  ON product_images(product_id);
