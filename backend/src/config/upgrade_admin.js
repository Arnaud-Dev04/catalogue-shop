import db from './db.js';

async function upgrade() {
  try {
    console.log('Mise à jour du compte par défaut vers superadmin...');
    await db.execute({ 
      sql: "UPDATE users SET role = 'superadmin' WHERE email = 'admin@catalogue.com'",
      args: [] 
    });
    console.log('✅ Compte admin@catalogue.com est maintenant superadmin !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err);
    process.exit(1);
  }
}

upgrade();
