/// /// voting.route.ts

import express from 'express';
import { checkVoterStatus, createPoll, getPoll, getPollResults, submitVote } from '../controllers/voting.controller';

const router = express.Router();

router.post('/polls', createPoll);
router.get('/polls/:id', getPoll);
router.post('/polls/vote', submitVote);
router.get('/polls/:id/results', getPollResults);
router.get('/polls/:pollId/voter/:voterId', checkVoterStatus);

export default router;