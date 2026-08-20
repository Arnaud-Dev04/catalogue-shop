import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
} from '../controllers/productController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Routes publiques
router.get('/',          getProducts);
router.get('/featured',  getFeaturedProducts);
router.get('/:id',       getProduct);

// Routes protégées (admin)
router.post('/',         authenticateToken, requireAdmin, createProduct);
router.put('/:id',       authenticateToken, requireAdmin, updateProduct);
router.delete('/:id',    authenticateToken, requireAdmin, deleteProduct);

export default router;
