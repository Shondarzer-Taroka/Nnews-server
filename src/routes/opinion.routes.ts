import express from 'express';
import { createOpinion, getOpinions } from '../controller/opinion.controller';

const router = express.Router();

router.post('/', createOpinion);
router.get('/', getOpinions);

export default router;