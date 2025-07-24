// import express from 'express';
// import {
//   createOpinion,
//   getOpinionById,
//   getOpinions,
//   getRelatedOpinions,
//   updateOpinion,
//   deleteOpinion
// } from  '../controllers/opinion.controller';

// const router = express.Router();

// router.post('/create', createOpinion);
// router.get('/getAllOpinions', getOpinions);
// router.get('/related', getRelatedOpinions);
// router.get('/getSingleOpinion/:id', getOpinionById);
// router.put('/:id', updateOpinion);
// router.delete('/:id', deleteOpinion);

// export default router;











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
// import authMiddleware from '../middleware/auth';

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