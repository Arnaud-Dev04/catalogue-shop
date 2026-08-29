import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes     from './routes/auth.js';
import productRoutes  from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes    from './routes/orders.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes   from './routes/upload.js';
import userRoutes     from './routes/users.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares globaux ─────────────────────────────────────────
app.use(cors({
  origin: true, // Accepte dynamiquement l'URL du frontend (localhost ou Vercel)
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes API ─────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/settings',   settingsRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/users',      userRoutes);

// Stats du dashboard (alias lisible)
app.use('/api/admin',      settingsRoutes);

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API opérationnelle', timestamp: new Date() });
});

// ── Route 404 ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.originalUrl}` });
});

// ── Gestion d'erreurs globale ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Erreur non gérée :', err.stack);
  res.status(500).json({ error: 'Une erreur interne est survenue.' });
});

// ── Démarrage du serveur ───────────────────────────────────────
// Vercel n'a pas besoin de app.listen(), il gère lui-même les requêtes.
// On ne lance app.listen() que si on est en local (développement).
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`   Environnement : ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export obligatoire pour que Vercel puisse utiliser l'application comme fonction Serverless
export default app;
