import express from 'express';
import {
  createOpinion,
  getOpinionById,
  getOpinions,
  getRelatedOpinions,
  updateOpinion,
  deleteOpinion
} from  '../controllers/opinion.controller';

const router = express.Router();

router.post('/create', createOpinion);
router.get('/getAllOpinions', getOpinions);
router.get('/related', getRelatedOpinions);
router.get('/getSingleOpinion/:id', getOpinionById);
router.put('/:id', updateOpinion);
router.delete('/:id', deleteOpinion);

export default router;