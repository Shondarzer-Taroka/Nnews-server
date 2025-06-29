import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
let io: Server;

export const initializeVotingSocket = (socketIo: Server) => {
  io = socketIo;
  
  io.on('connection', (socket) => {
    console.log('New client connected for voting updates');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from voting updates');
    });
  });
};

interface VoteInput {
  pollId: string;
  optionId: string;
  voterId: string; // Unique identifier for the voter
}

export const createPoll = async (req: Request, res: Response):Promise<any> => {
  try {
    const { question, options } = req.body;
    
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least two options are required' });
    }
    
    const poll = await prisma.poll.create({
      data: {
        question,
        options: {
          create: options.map((optionText: string) => ({
            text: optionText,
            votes: 0
          }))
        }
      },
      include: {
        options: true
      }
    });
    
    res.status(201).json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

export const getPoll = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: true
      }
    });
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    res.json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
};

export const submitVote = async (req: Request, res: Response):Promise<any> => {
  try {
    const { pollId, optionId, voterId }: VoteInput = req.body;
    
    if (!pollId || !optionId || !voterId) {
      return res.status(400).json({ error: 'pollId, optionId, and voterId are required' });
    }
    
    // Check if poll exists
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true }
    });
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Check if option exists in this poll
    const optionExists = poll.options.some(option => option.id === optionId);
    if (!optionExists) {
      return res.status(400).json({ error: 'Invalid option for this poll' });
    }
    
    // Check if this voter has already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        pollId,
        voterId
      }
    });
    
    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted in this poll' });
    }
    
    // Start transaction
    const [updatedOption, voteRecord] = await prisma.$transaction([
      // Increment vote count for the option
      prisma.pollOption.update({
        where: { id: optionId },
        data: {
          votes: {
            increment: 1
          }
        }
      }),
      
      // Create vote record
      prisma.vote.create({
        data: {
          pollId,
          optionId,
          voterId
        }
      })
    ]);
    
    // Get updated poll data
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true }
    });
    
    // Broadcast the update to all connected clients
    if (io && updatedPoll) {
      io.emit('voteUpdate', updatedPoll);
    }
    
    res.json(updatedPoll);
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
};

export const getPollResults = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: {
            votes: 'desc'
          }
        }
      }
    });
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Calculate percentages
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
    const results = poll.options.map(option => ({
      ...option,
      percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
    }));
    
    res.json({
      ...poll,
      options: results,
      totalVotes
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({ error: 'Failed to fetch poll results' });
  }
};

export const checkVoterStatus = async (req: Request, res: Response):Promise<any> => {
  try {
    const { pollId, voterId } = req.params;
    
    const existingVote = await prisma.vote.findFirst({
      where: {
        pollId,
        voterId
      }
    });
    
    res.json({
      hasVoted: !!existingVote,
      votedOptionId: existingVote?.optionId || null
    });
  } catch (error) {
    console.error('Error checking voter status:', error);
    res.status(500).json({ error: 'Failed to check voter status' });
  }
};