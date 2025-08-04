
import express, { RequestHandler } from 'express'; 
import {
  toggleLike,
  createComment,
  getComments,
  getLikeStatus,
  updateComment,
  deleteComment
} from '../controllers/likeComment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Like routes
router.post('/:entityType/:entityId/like', authenticate, toggleLike as RequestHandler);
router.get('/:entityType/:entityId/like-status', authenticate, getLikeStatus as RequestHandler);

// Comment routes
router.post('/:entityType/:entityId/comments', authenticate, createComment as RequestHandler);
router.get('/:entityType/:entityId/comments', getComments as RequestHandler);
router.put('/comments/:commentId', authenticate, updateComment as RequestHandler);
router.delete('/comments/:commentId', authenticate, deleteComment as RequestHandler);

export default router;




