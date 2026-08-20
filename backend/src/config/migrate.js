import pool from '../config/db.js';

// ============================================================
// SCRIPT DE MIGRATION : Initialisation des tables
// Exécuter avec : node src/config/migrate.js
// ============================================================

async function migrate() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Création des tables en cours...');

    // TABLE : users
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        name          VARCHAR(255) NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role          VARCHAR(50) DEFAULT 'admin',
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✔ Table users créée.');

    // TABLE : categories
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        slug        VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url   VARCHAR(500),
        is_active   BOOLEAN DEFAULT TRUE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✔ Table categories créée.');

    // TABLE : products
    await conn.execute(`
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
      )
    `);
    console.log('  ✔ Table products créée.');

    // TABLE : product_images
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        product_id  INT,
        image_url   VARCHAR(500) NOT NULL,
        is_primary  BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✔ Table product_images créée.');

    // TABLE : orders
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        customer_name  VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        total          DECIMAL(15, 2) NOT NULL,
        status         VARCHAR(50) DEFAULT 'pending',
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✔ Table orders créée.');

    // TABLE : order_items
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        order_id    INT,
        product_id  INT,
        quantity    INT NOT NULL,
        unit_price  DECIMAL(15, 2) NOT NULL,
        subtotal    DECIMAL(15, 2) NOT NULL,
        FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `);
    console.log('  ✔ Table order_items créée.');

    // TABLE : settings
    await conn.execute(`
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
      )
    `);
    console.log('  ✔ Table settings créée.');

    console.log('\n✅ Migration terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors de la migration :', err.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
