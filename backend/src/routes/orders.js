import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Créer une commande (public : le client commande)
router.post('/',     createOrder);

// Routes protégées (admin)
router.get('/',      authenticateToken, requireAdmin, getOrders);
router.get('/:id',   authenticateToken, requireAdmin, getOrder);
router.put('/:id',   authenticateToken, requireAdmin, updateOrderStatus);

export default router;
