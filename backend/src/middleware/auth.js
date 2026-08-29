import jwt from 'jsonwebtoken';

// ── Vérifie le token JWT dans le header Authorization ──────────
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format : "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide ou expiré.' });
  }
}

// ── Vérifie que l'utilisateur a des droits (admin ou superadmin) ────────────
export function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }
  next();
}

// ── Vérifie que l'utilisateur est STRICTEMENT superadmin ────────────
export function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Accès réservé au Super Administrateur.' });
  }
  next();
}
