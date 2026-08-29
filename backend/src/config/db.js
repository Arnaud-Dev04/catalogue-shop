import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

// Client libSQL (Turso) — remplace le pool mysql2
const db = createClient({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Test de connexion au démarrage
db.execute('SELECT 1')
  .then(() => console.log('✅ Connexion à Turso réussie.'))
  .catch(err => console.error('❌ Erreur de connexion à Turso :', err.message));

export default db;
