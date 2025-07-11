import express, { RequestHandler } from 'express'; 
import {
  toggleLike,
  createComment,
  getComments,
  getLikeStatus
} from '../controllers/likeComment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Like routes - no authentication required
router.post('/opinions/:opinionId/like', toggleLike as RequestHandler);
router.get('/opinions/:opinionId/like-status', getLikeStatus as RequestHandler);

// Comment routes - authentication required for creation
router.post('/opinions/:opinionId/comments', authenticate as RequestHandler, createComment as RequestHandler);
router.get('/opinions/:opinionId/comments', getComments as RequestHandler);

export default router;