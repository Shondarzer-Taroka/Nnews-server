
import { Router } from 'express';
import {
  createOpinion,
  deleteOpinion,
  getAllOpinions,
  getOpinionById,
  getOpinions,
  getRelatedOpinions,
  updateOpinion,
  updateOpinionStatus
} from '../controllers/opinion.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create', authenticate, createOpinion);
router.get('/', authenticate, getAllOpinions);
router.put('/:id/status', authenticate, updateOpinionStatus);

router.get('/getAllOpinions', getOpinions);
router.get('/related', getRelatedOpinions);
router.get('/getSingleOpinion/:id', getOpinionById);
router.put('/:id', updateOpinion);
router.delete('/:id', deleteOpinion);

export default router;

