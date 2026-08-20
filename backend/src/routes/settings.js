import { Router } from 'express';
import { getSettings, updateSettings, getDashboardStats } from '../controllers/settingsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Paramètres publics (WhatsApp, email, devise, etc.)
router.get('/', getSettings);

// Mise à jour réservée à l'admin
router.put('/', authenticateToken, requireAdmin, updateSettings);

// Statistiques dashboard (admin)
router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);

export default router;
