"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getLikeStatus = exports.getComments = exports.createComment = exports.toggleLike = void 0;
// // backend/src/controller/likeComment.controller.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Helper function to validate UUID
function isValidUUID(uuid) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
}
const toggleLike = async (req, res) => {
    try {
        const { opinionId } = req.params;
        // Basic validation
        if (!opinionId || !isValidUUID(opinionId)) {
            return res.status(400).json({ error: 'Invalid opinion ID' });
        }
        // Check if opinion exists
        const opinionExists = await prisma.opinion.findUnique({
            where: { id: opinionId },
            select: { id: true }
        });
        if (!opinionExists) {
            return res.status(404).json({ error: 'Opinion not found' });
        }
        const userId = req.user?.id;
        const userIp = req.ip;
        // Check if user already liked this opinion
        const existingLike = userId
            ? await prisma.like.findUnique({
                where: { userId_opinionId: { userId, opinionId } }
            })
            : await prisma.like.findFirst({
                where: { userIp, opinionId }
            });
        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            const likeCount = await prisma.like.count({ where: { opinionId } });
            return res.json({ liked: false, likeCount });
        }
        else {
            // Like
            await prisma.like.create({
                data: {
                    userId,
                    opinionId,
                    userIp: userId ? null : userIp
                }
            });
            const likeCount = await prisma.like.count({ where: { opinionId } });
            return res.json({ liked: true, likeCount });
        }
    }
    catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.toggleLike = toggleLike;
const createComment = async (req, res) => {
    try {
        const { opinionId } = req.params;
        const { content } = req.body;
        console.log(opinionId, content, 'op comee');
        // Validate opinion ID
        if (!opinionId || !isValidUUID(opinionId)) {
            return res.status(400).json({ error: 'Invalid opinion ID' });
        }
        // Validate content
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }
        if (content.length > 1000) {
            return res.status(400).json({ error: 'Comment must be less than 1000 characters' });
        }
        // Check authentication
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Check if opinion exists
        const opinionExists = await prisma.opinion.findUnique({
            where: { id: opinionId },
            select: { id: true }
        });
        if (!opinionExists) {
            return res.status(404).json({ error: 'Opinion not found' });
        }
        // Create comment
        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                userId: req.user?.id,
                opinionId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });
        const commentCount = await prisma.comment.count({ where: { opinionId } });
        res.status(201).json({ comment, commentCount });
    }
    catch (error) {
        console.error('Comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createComment = createComment;
const getComments = async (req, res) => {
    try {
        const { opinionId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        // Validate opinion ID
        if (!opinionId || !isValidUUID(opinionId)) {
            return res.status(400).json({ error: 'Invalid opinion ID' });
        }
        // Validate pagination
        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 50) {
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }
        // Get comments
        const comments = await prisma.comment.findMany({
            where: { opinionId },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });
        const totalComments = await prisma.comment.count({ where: { opinionId } });
        const hasMore = skip + limit < totalComments;
        res.json({
            comments,
            totalComments,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        });
    }
    catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getComments = getComments;
const getLikeStatus = async (req, res) => {
    try {
        const { opinionId } = req.params;
        console.log(req.params, 'like');
        // Validate opinion ID
        if (!opinionId || !isValidUUID(opinionId)) {
            return res.status(400).json({ error: 'Invalid opinion ID' });
        }
        // Check if opinion exists
        const opinionExists = await prisma.opinion.findUnique({
            where: { id: opinionId },
            select: { id: true }
        });
        if (!opinionExists) {
            return res.status(404).json({ error: 'Opinion not found' });
        }
        // Get like count
        const likeCount = await prisma.like.count({ where: { opinionId } });
        // Check if current user liked
        let liked = false;
        if (req.user?.id) {
            const userLike = await prisma.like.findUnique({
                where: { userId_opinionId: { userId: req.user?.id, opinionId } }
            });
            liked = !!userLike;
        }
        else if (req.ip) {
            const ipLike = await prisma.like.findFirst({
                where: { userIp: req.ip, opinionId }
            });
            liked = !!ipLike;
        }
        res.json({ liked, likeCount });
    }
    catch (error) {
        console.error('Like status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getLikeStatus = getLikeStatus;
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user?.id;
        // Validate comment ID
        if (!commentId || !isValidUUID(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }
        // Validate content
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }
        if (content.length > 1000) {
            return res.status(400).json({ error: 'Comment must be less than 1000 characters' });
        }
        // Check if comment exists and belongs to user
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { id: true, userId: true, opinionId: true }
        });
        if (!existingComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (existingComment.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized to update this comment' });
        }
        // Update comment
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { content: content.trim() },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });
        // Get updated comment count
        const commentCount = await prisma.comment.count({
            where: { opinionId: existingComment.opinionId }
        });
        res.json({
            comment: updatedComment,
            commentCount
        });
    }
    catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id;
        // Validate comment ID
        if (!commentId || !isValidUUID(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }
        // Check if comment exists and belongs to user
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { id: true, userId: true, opinionId: true }
        });
        if (!existingComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (existingComment.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }
        // Delete comment
        await prisma.comment.delete({
            where: { id: commentId }
        });
        // Get updated comment count
        const commentCount = await prisma.comment.count({
            where: { opinionId: existingComment.opinionId }
        });
        res.json({
            success: true,
            commentCount
        });
    }
    catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteComment = deleteComment;
