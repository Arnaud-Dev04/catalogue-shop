import pool from '../config/db.js';

// Script pour vider toutes les tables et relancer le seed proprement
async function reset() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Remise à zéro des données...');

    // Désactiver les contraintes de clés étrangères le temps de vider
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

    await conn.execute('TRUNCATE TABLE order_items');
    await conn.execute('TRUNCATE TABLE orders');
    await conn.execute('TRUNCATE TABLE product_images');
    await conn.execute('TRUNCATE TABLE products');
    await conn.execute('TRUNCATE TABLE categories');
    await conn.execute('TRUNCATE TABLE settings');
    await conn.execute('TRUNCATE TABLE users');

    // Réactiver les contraintes
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Toutes les tables ont été vidées. Lancez maintenant : npm run seed');

  } catch (err) {
    console.error('❌ Erreur lors du reset :', err.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

reset();
