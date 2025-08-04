"use strict";
// // // backend/src/controller/likeComment.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getComments = exports.createComment = exports.getLikeStatus = exports.toggleLike = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function isValidUUID(uuid) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
}
const toggleLike = async (req, res) => {
    try {
        const { opinionId } = req.params;
        const userId = req.user?.id;
        console.log(userId, 'llik');
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'You must be logged in to like'
            });
        }
        if (!opinionId || !isValidUUID(opinionId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid opinion ID'
            });
        }
        const opinionExists = await prisma.opinion.findUnique({
            where: { id: opinionId },
            select: { id: true }
        });
        if (!opinionExists) {
            return res.status(404).json({
                success: false,
                error: 'Opinion not found'
            });
        }
        // Check for existing like by userId only
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_opinionId: {
                    userId,
                    opinionId
                }
            }
        });
        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    userId_opinionId: {
                        userId,
                        opinionId
                    }
                }
            });
            const likeCount = await prisma.like.count({ where: { opinionId } });
            return res.json({
                success: true,
                liked: false,
                likeCount,
                message: 'Like removed successfully'
            });
        }
        else {
            // Like
            await prisma.like.create({
                data: {
                    userId,
                    opinionId
                }
            });
            const likeCount = await prisma.like.count({ where: { opinionId } });
            return res.json({
                success: true,
                liked: true,
                likeCount,
                message: 'Like added successfully'
            });
        }
    }
    catch (error) {
        console.error('Like error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to process like action'
        });
    }
};
exports.toggleLike = toggleLike;
const getLikeStatus = async (req, res) => {
    try {
        const { opinionId } = req.params;
        const userId = req.user?.id;
        if (!opinionId || !isValidUUID(opinionId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid opinion ID'
            });
        }
        const opinionExists = await prisma.opinion.findUnique({
            where: { id: opinionId },
            select: { id: true }
        });
        if (!opinionExists) {
            return res.status(404).json({
                success: false,
                error: 'Opinion not found'
            });
        }
        const likeCount = await prisma.like.count({ where: { opinionId } });
        let liked = false;
        if (userId) {
            const userLike = await prisma.like.findUnique({
                where: {
                    userId_opinionId: {
                        userId,
                        opinionId
                    }
                }
            });
            liked = !!userLike;
        }
        return res.json({
            success: true,
            liked,
            likeCount,
            message: 'Like status retrieved successfully'
        });
    }
    catch (error) {
        console.error('Like status error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to get like status'
        });
    }
};
exports.getLikeStatus = getLikeStatus;
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
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user?.id;
        console.log(userId, 'k');
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
        console.log(existingComment, 'up com');
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
