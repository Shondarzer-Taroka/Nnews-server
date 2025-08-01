
import { Router } from 'express';
import {
  createOpinion,
  deleteOpinion,
  getAllOpinions,
  getOpinionByEmail,
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
router.get('/getOpinionByEmail/:email', getOpinionByEmail);
router.put('/update/:id', updateOpinion);
router.delete('/delete/:id', authenticate, deleteOpinion);

export default router;

