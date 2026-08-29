import db from '../config/db.js';

async function migrate() {
  try {
    console.log('🔄 Création des tables en cours...');

    await db.execute({ sql: `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT DEFAULT 'admin', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`, args: [] });
    console.log('  ✔ Table users créée.');

    await db.execute({ sql: `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, image_url TEXT, is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`, args: [] });
    console.log('  ✔ Table categories créée.');

    await db.execute({ sql: `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, price REAL NOT NULL, stock INTEGER NOT NULL DEFAULT 0, is_active INTEGER DEFAULT 1, is_featured INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`, args: [] });
    console.log('  ✔ Table products créée.');

    await db.execute({ sql: `CREATE TABLE IF NOT EXISTS product_images (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, image_url TEXT NOT NULL, is_primary INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`, args: [] });
    console.log('  ✔ Table product_images créée.');

    await db.execute({ sql: `CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL, customer_email TEXT NOT NULL, total REAL NOT NULL, status TEXT DEFAULT 'pending', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`, args: [] });
    console.log('  ✔ Table orders créée.');

    await db.execute({ sql: `CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE, product_id INTEGER REFERENCES products(id) ON DELETE SET NULL, quantity INTEGER NOT NULL, unit_price REAL NOT NULL, subtotal REAL NOT NULL)`, args: [] });
    console.log('  ✔ Table order_items créée.');

    await db.execute({ sql: `CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, business_name TEXT NOT NULL, logo_url TEXT, whatsapp_number TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, address TEXT, currency TEXT DEFAULT 'BIF', updated_at TEXT DEFAULT (datetime('now')))`, args: [] });
    console.log('  ✔ Table settings créée.');

    // Index
    await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)', args: [] });
    await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)', args: [] });
    await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)', args: [] });
    await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_product_images_prod ON product_images(product_id)', args: [] });
    await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)', args: [] });

    console.log('\n✅ Migration terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors de la migration :', err.message);
    process.exit(1);
  }
  process.exit(0);
}

migrate();
