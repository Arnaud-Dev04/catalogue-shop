import { Router } from 'express';
import {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Routes publiques
router.get('/',      getCategories);
router.get('/all',   authenticateToken, requireAdmin, getAllCategories); // admin : inclut inactives
router.get('/:id',   getCategory);

// Routes protégées (admin)
router.post('/',     authenticateToken, requireAdmin, createCategory);
router.put('/:id',   authenticateToken, requireAdmin, updateCategory);
router.delete('/:id',authenticateToken, requireAdmin, deleteCategory);

export default router;
