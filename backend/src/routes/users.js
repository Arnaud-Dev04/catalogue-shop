import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Toutes les routes utilisateurs sont strictement réservées au superadmin
router.use(authenticateToken, requireSuperAdmin);

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
