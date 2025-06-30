// voting.routes.ts

import express from 'express';
import { createPoll, getLatestPoll, getPoll, getPolls, getPollWithResults, submitVote } from '../controllers/voting.controller';


const router = express.Router();

// Create a new poll
router.post('/createPoll', createPoll);

router.get('/getLatestPoll',getLatestPoll)
// Get a specific poll
router.get('/:id', getPoll);

// Get all polls
router.get('/', getPolls);


// Submit a vote
router.post('/vote', submitVote);

// Get poll with results
router.get('/:pollId', getPollWithResults);

export default router;