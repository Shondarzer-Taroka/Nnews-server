"use strict";
// voting.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const voting_controller_1 = require("../controllers/voting.controller");
const router = express_1.default.Router();
// Create a new poll
router.post('/createPoll', voting_controller_1.createPoll);
router.get('/getLatestPoll', voting_controller_1.getLatestPoll);
// Get a specific poll
router.get('/:id', voting_controller_1.getPoll);
// Get all polls
router.get('/', voting_controller_1.getPolls);
// Submit a vote
router.post('/vote', voting_controller_1.submitVote);
// Get poll with results
router.get('/:pollId', voting_controller_1.getPollWithResults);
exports.default = router;
