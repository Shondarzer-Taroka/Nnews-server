import { Router,RequestHandler} from 'express';
import { 
  getAllUsers, 
  updateUserRole, 
  toggleUserStatus,
  deleteUser
} from '../controllers/user.admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/isAdmin';



const router = Router();

// Admin routes
router.get('/', authenticate, isAdmin as RequestHandler, getAllUsers);
router.put('/:userId/role', authenticate, isAdmin as RequestHandler, updateUserRole as RequestHandler);
router.put('/:userId/status', authenticate, isAdmin as RequestHandler, toggleUserStatus as RequestHandler);
router.delete('/:userId', authenticate, isAdmin as RequestHandler, deleteUser as RequestHandler);

export default router;