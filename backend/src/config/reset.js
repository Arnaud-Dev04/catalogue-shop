import db from '../config/db.js';

async function reset() {
  try {
    console.log('🔄 Remise à zéro des données...');

    await db.execute({ sql: 'PRAGMA foreign_keys = OFF', args: [] });
    await db.execute({ sql: 'DELETE FROM order_items', args: [] });
    await db.execute({ sql: 'DELETE FROM orders', args: [] });
    await db.execute({ sql: 'DELETE FROM product_images', args: [] });
    await db.execute({ sql: 'DELETE FROM products', args: [] });
    await db.execute({ sql: 'DELETE FROM categories', args: [] });
    await db.execute({ sql: 'DELETE FROM settings', args: [] });
    await db.execute({ sql: 'DELETE FROM users', args: [] });
    await db.execute({ sql: 'PRAGMA foreign_keys = ON', args: [] });

    console.log('✅ Toutes les tables ont été vidées. Lancez maintenant : npm run seed');
  } catch (err) {
    console.error('❌ Erreur lors du reset :', err.message);
    process.exit(1);
  }
  process.exit(0);
}

reset();
