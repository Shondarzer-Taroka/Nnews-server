"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpinionByEmail = exports.createOpinion = exports.updateOpinionStatus = exports.getAllOpinions = exports.deleteOpinion = exports.updateOpinion = exports.getRelatedOpinions = exports.getOpinions = exports.getOpinionById = void 0;
// backend/src/controller/opinion.controller.ts
const client_1 = require("@prisma/client");
const app_1 = require("../app");
const prisma = new client_1.PrismaClient();
const getOpinionById = async (req, res) => {
    try {
        const { id } = req.params;
        const opinion = await prisma.opinion.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        likes: true, // Singular model name as per your schema
                        comments: true // Singular model name as per your schema
                    }
                }
            }
        });
        if (!opinion) {
            return res.status(404).json({ success: false, message: 'Opinion not found' });
        }
        // Check if current user has liked this opinion
        let isLiked = false;
        if (req.user?.id) {
            const like = await prisma.like.findFirst({
                where: {
                    opinionId: id,
                    userId: req.user?.id
                }
            });
            isLiked = !!like;
        }
        return res.status(200).json({
            success: true,
            message: 'Opinion retrieved successfully',
            data: {
                ...opinion,
                likesCount: opinion._count?.likes || 0, // Use singular model name
                commentsCount: opinion._count?.comments || 0, // Use singular model name
                isLiked
            }
        });
    }
    catch (error) {
        console.error('Error fetching opinion:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : error
        });
    }
};
exports.getOpinionById = getOpinionById;
// Get All Opinions with Pagination
const getOpinions = async (req, res) => {
    try {
        const { page = '1', limit = '10', search = '' } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const whereClause = search
            ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } }
                ]
            }
            : {};
        const [opinions, total] = await Promise.all([
            prisma.opinion.findMany({
                skip,
                take: limitNumber,
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { id: true, name: true, image: true } }
                }
            }),
            prisma.opinion.count({ where: whereClause })
        ]);
        return res.status(200).json({
            success: true,
            message: 'Opinions retrieved successfully',
            data: {
                opinions,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(total / limitNumber)
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching opinions:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : error
        });
    }
};
exports.getOpinions = getOpinions;
// Get Related Opinions
const getRelatedOpinions = async (req, res) => {
    try {
        const { currentId } = req.query;
        const opinions = await prisma.opinion.findMany({
            take: 4,
            where: {
                NOT: { id: currentId }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, name: true } }
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Related opinions retrieved successfully',
            data: opinions
        });
    }
    catch (error) {
        console.error('Error fetching related opinions:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : error
        });
    }
};
exports.getRelatedOpinions = getRelatedOpinions;
// Update Opinion
const updateOpinion = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, subCategory, imageSource, imageTitle, keywords, subKeywords, imageUrl, authorId } = req.body;
        const existingOpinion = await prisma.opinion.findUnique({ where: { id } });
        if (!existingOpinion) {
            return res.status(404).json({ success: false, message: 'Opinion not found' });
        }
        if (existingOpinion.authorId !== authorId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this opinion' });
        }
        const updatedOpinion = await prisma.opinion.update({
            where: { id },
            data: {
                title: title ?? existingOpinion.title,
                content: content ?? existingOpinion.content,
                category: category ?? existingOpinion.category,
                subCategory: subCategory ?? existingOpinion.subCategory,
                imageSource: imageSource ?? existingOpinion.imageSource,
                imageTitle: imageTitle ?? existingOpinion.imageTitle,
                keywords: keywords ?? existingOpinion.keywords,
                subKeywords: subKeywords ?? existingOpinion.subKeywords,
                imageUrl: imageUrl ?? existingOpinion.imageUrl
            },
            include: {
                author: { select: { id: true, name: true } }
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Opinion updated successfully',
            data: updatedOpinion
        });
    }
    catch (error) {
        console.error('Error updating opinion:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : error
        });
    }
};
exports.updateOpinion = updateOpinion;
// Delete Opinion
const deleteOpinion = async (req, res) => {
    try {
        const { id } = req.params;
        const authorId = req.user.id;
        const existingOpinion = await prisma.opinion.findUnique({ where: { id } });
        if (!existingOpinion) {
            return res.status(404).json({ success: false, message: 'Opinion not found' });
        }
        if (existingOpinion.authorId !== authorId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this opinion' });
        }
        await prisma.opinion.delete({ where: { id } });
        return res.status(200).json({
            success: true,
            message: 'Opinion deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting opinion:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : error
        });
    }
};
exports.deleteOpinion = deleteOpinion;
const getAllOpinions = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const where = {};
        if (status)
            where.status = status;
        const opinions = await prisma.opinion.findMany({
            where,
            include: {
                author: { select: { id: true, name: true, email: true } }
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma.opinion.count({ where });
        return res.status(200).json({
            success: true,
            data: opinions,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching opinions:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getAllOpinions = getAllOpinions;
const updateOpinionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        const opinion = await prisma.opinion.findUnique({
            where: { id },
            include: { author: true }
        });
        if (!opinion) {
            return res.status(404).json({ success: false, message: 'Opinion not found' });
        }
        const updatedOpinion = await prisma.opinion.update({
            where: { id },
            data: { status }
        });
        // Create notification for user
        await prisma.notification.create({
            data: {
                type: status === 'APPROVED' ? 'OPINION_APPROVED' : 'OPINION_REJECTED',
                message: status === 'APPROVED'
                    ? `Your opinion "${opinion.title}" has been approved`
                    : `Your opinion "${opinion.title}" was rejected${rejectionReason ? `: ${rejectionReason}` : ''}`,
                userId: opinion.authorId,
                opinionId: opinion.id
            }
        });
        // Notify user
        (0, app_1.emitToUser)(opinion.authorId, 'opinion_status_update', {
            type: status === 'APPROVED' ? 'OPINION_APPROVED' : 'OPINION_REJECTED',
            message: status === 'APPROVED'
                ? `Your opinion "${opinion.title}" has been approved`
                : `Your opinion "${opinion.title}" was rejected`,
            opinionId: opinion.id
        });
        return res.status(200).json({
            success: true,
            message: 'Opinion status updated successfully',
            data: updatedOpinion
        });
    }
    catch (error) {
        console.error('Error updating opinion status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateOpinionStatus = updateOpinionStatus;
const createOpinion = async (req, res) => {
    try {
        const { title, content, category, subCategory, imageSource = "Unknown", imageTitle = "Untitled", keywords = [], subKeywords = [], imageUrl, } = req.body;
        const authorId = req.user.id;
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }
        const opinion = await prisma.opinion.create({
            data: {
                title,
                content,
                category,
                subCategory,
                imageSource,
                imageTitle,
                keywords,
                subKeywords,
                imageUrl,
                authorId,
                status: 'PENDING'
            },
            include: {
                author: { select: { id: true, name: true, email: true } }
            }
        });
        // Create notification
        const notification = await prisma.notification.create({
            data: {
                type: 'OPINION_SUBMITTED',
                message: `New opinion submitted by ${req.user.name}: "${opinion.title}"`,
                userId: authorId,
                opinionId: opinion.id,
                read: false
            },
            include: {
                user: {
                    select: {
                        name: true
                    }
                },
                opinion: {
                    select: {
                        title: true
                    }
                }
            }
        });
        // Emit to admins
        (0, app_1.emitToAdmins)('new_admin_notification', notification);
        // Update admin count
        const adminUnreadCount = await prisma.notification.count({
            where: {
                type: 'OPINION_SUBMITTED',
                read: false
            }
        });
        (0, app_1.emitToAdmins)('admin_notification_count', { count: adminUnreadCount });
        return res.status(201).json({
            success: true,
            message: 'Opinion created successfully',
            data: opinion
        });
    }
    catch (error) {
        console.error('Error creating opinion:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.createOpinion = createOpinion;
const getOpinionByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found with that email' });
        }
        const [opinions, total] = await Promise.all([
            prisma.opinion.findMany({
                where: { authorId: user.id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.opinion.count({ where: { authorId: user.id } }),
        ]);
        return res.status(200).json({
            opinions: opinions.map(op => ({
                ...op,
                name: user.name,
                email: user.email,
            })),
            total,
            page,
            limit,
        });
    }
    catch (error) {
        console.error('Error fetching opinions by email:', error);
        return res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getOpinionByEmail = getOpinionByEmail;
