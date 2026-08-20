import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Création d'un pool de connexions MySQL
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Nécessaire pour TiDB Cloud (connexion SSL)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
});

// Test de connexion au démarrage
pool.getConnection()
  .then(connection => {
    console.log('✅ Connexion à la base de données réussie.');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données :', err.message);
  });

export default pool;
