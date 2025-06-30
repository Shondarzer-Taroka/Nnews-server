"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPollWithResults = exports.submitVote = exports.getLatestPoll = exports.getPolls = exports.getPoll = exports.createPoll = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createPoll = async (req, res) => {
    try {
        // Validate request body
        const { question, options, endDate, user } = req.body;
        if (!question || !options || !endDate || !user?.id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: question, options, endDate, or user'
            });
        }
        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'At least two options are required'
            });
        }
        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: user.id }
        });
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Create the poll
        const poll = await prisma.poll.create({
            data: {
                question,
                endDate: new Date(endDate),
                userId: user.id,
                options: {
                    create: options.map(option => ({
                        text: option.trim()
                    }))
                }
            },
            include: {
                options: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });
        // Format the response
        const response = {
            id: poll.id,
            question: poll.question,
            endDate: poll.endDate,
            createdAt: poll.createdAt,
            options: poll.options.map(option => ({
                id: option.id,
                text: option.text
            })),
            user: {
                id: poll.user.id,
                name: poll.user.name,
                email: poll.user.email,
                image: poll.user.image
            },
            updatedAt: poll.updatedAt
        };
        return res.status(201).json({
            success: true,
            message: 'Poll created successfully',
            data: response
        });
    }
    catch (error) {
        console.error('Error creating poll:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createPoll = createPoll;
// ... (keep your existing interfaces and createPoll implementation)
const getPoll = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Poll ID is required'
            });
        }
        const poll = await prisma.poll.findUnique({
            where: { id },
            include: {
                options: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }
        // Format the response
        const response = {
            id: poll.id,
            question: poll.question,
            endDate: poll.endDate,
            createdAt: poll.createdAt,
            options: poll.options.map(option => ({
                id: option.id,
                text: option.text
            })),
            user: {
                id: poll.user.id,
                name: poll.user.name,
                email: poll.user.email,
                image: poll.user.image
            },
            updatedAt: poll.updatedAt
        };
        return res.status(200).json({
            success: true,
            data: response
        });
    }
    catch (error) {
        console.error('Error fetching poll:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getPoll = getPoll;
const getPolls = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Sorting parameters
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';
        // Filter parameters
        const userId = req.query.userId;
        const active = req.query.active;
        // Build where clause
        const where = {};
        if (userId)
            where.userId = userId;
        if (active) {
            const now = new Date();
            if (active === 'true') {
                where.endDate = { gte: now };
            }
            else {
                where.endDate = { lt: now };
            }
        }
        // Get polls with pagination
        const [polls, totalCount] = await Promise.all([
            prisma.poll.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder
                },
                include: {
                    options: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                }
            }),
            prisma.poll.count({ where })
        ]);
        // Format the response
        const response = polls.map(poll => ({
            id: poll.id,
            question: poll.question,
            endDate: poll.endDate,
            createdAt: poll.createdAt,
            options: poll.options.map(option => ({
                id: option.id,
                text: option.text
            })),
            user: {
                id: poll.user.id,
                name: poll.user.name,
                email: poll.user.email,
                image: poll.user.image
            }
        }));
        return res.status(200).json({
            success: true,
            data: response,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching polls:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getPolls = getPolls;
const getLatestPoll = async (req, res) => {
    try {
        // Get the most recent poll (either newly created or updated)
        const latestPoll = await prisma.poll.findFirst({
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                options: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });
        if (!latestPoll) {
            return res.status(404).json({
                success: false,
                message: 'No polls found'
            });
        }
        // Format the response
        const response = {
            id: latestPoll.id,
            question: latestPoll.question,
            endDate: latestPoll.endDate,
            createdAt: latestPoll.createdAt,
            updatedAt: latestPoll.updatedAt,
            options: latestPoll.options.map(option => ({
                id: option.id,
                text: option.text
            })),
            user: {
                id: latestPoll.user.id,
                name: latestPoll.user.name,
                email: latestPoll.user.email,
                image: latestPoll.user.image
            }
        };
        return res.status(200).json({
            success: true,
            data: response
        });
    }
    catch (error) {
        console.error('Error fetching latest poll:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getLatestPoll = getLatestPoll;
const submitVote = async (req, res) => {
    try {
        const { optionId, voterId } = req.body;
        console.log(req.body);
        if (!optionId || !voterId) {
            return res.status(400).json({
                success: false,
                message: 'Option ID and voter ID are required'
            });
        }
        // Check if this voter already voted in this poll
        const existingVote = await prisma.vote.findFirst({
            where: {
                option: {
                    pollId: (await prisma.pollOption.findUnique({
                        where: { id: optionId },
                        select: { pollId: true }
                    }))?.pollId
                },
                voterId
            }
        });
        if (existingVote) {
            return res.status(400).json({
                success: false,
                message: 'আপনি ইতিমধ্যেই এই জরিপে ভোট দিয়েছেন'
                // message: 'You have already voted in this poll'
            });
        }
        // Create the vote
        const vote = await prisma.vote.create({
            data: {
                optionId,
                voterId
            },
            include: {
                option: {
                    include: {
                        poll: true
                    }
                }
            }
        });
        // Get updated vote counts
        const poll = await prisma.poll.findUnique({
            where: { id: vote.option.pollId },
            include: {
                options: {
                    include: {
                        votes: true
                    }
                }
            }
        });
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }
        // Calculate percentages
        const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
        const optionsWithPercentage = poll.options.map(option => ({
            id: option.id,
            text: option.text,
            votes: option.votes.length,
            percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0
        }));
        return res.status(200).json({
            success: true,
            message: 'Vote submitted successfully',
            data: {
                totalVotes,
                options: optionsWithPercentage
            }
        });
    }
    catch (error) {
        console.error('Error submitting vote:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.submitVote = submitVote;
const getPollWithResults = async (req, res) => {
    try {
        const { pollId } = req.params;
        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                options: {
                    include: {
                        votes: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }
        // Calculate percentages
        const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
        const optionsWithPercentage = poll.options.map(option => ({
            id: option.id,
            text: option.text,
            votes: option.votes.length,
            percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0
        }));
        return res.status(200).json({
            success: true,
            data: {
                id: poll.id,
                question: poll.question,
                endDate: poll.endDate,
                createdAt: poll.createdAt,
                updatedAt: poll.updatedAt,
                totalVotes,
                options: optionsWithPercentage,
                user: poll.user
            }
        });
    }
    catch (error) {
        console.error('Error fetching poll:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getPollWithResults = getPollWithResults;
