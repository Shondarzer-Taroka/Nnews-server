// // // backend/src/routes/notification.routes.ts


import { Router ,RequestHandler} from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getAdminNotifications,
  getUserNotifications,
  getUnreadCount,
  markAllAsRead,
  markSingleAsRead,
  getUserNotificationsById,
  getAdminUnreadCount
} from '../controllers/notification.controller';

const router = Router();

// Admin notifications
router.get('/admin', authenticate, getAdminNotifications as RequestHandler);

// User notifications
router.get('/user', authenticate, getUserNotifications as RequestHandler);

// Unread count
router.get('/unread-count', authenticate, getUnreadCount as RequestHandler);

// Mark all as read
router.post('/mark-as-read', authenticate, markAllAsRead as RequestHandler);

// Mark single as read
router.post('/:id/read', authenticate, markSingleAsRead as RequestHandler);

// Get notifications by user ID
router.get('/', authenticate, getUserNotificationsById as RequestHandler);

router.get('/admin', authenticate, getAdminNotifications as RequestHandler);
router.get('/admin/unread-count', authenticate, getAdminUnreadCount as RequestHandler);

export default router;