// backend/src/controller/opinion.controller.ts
import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { emitToAdmins, emitToUser } from '../app';

const prisma = new PrismaClient();





export const getOpinionById = async (req: Request, res: Response): Promise<any> => {
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
            likes: true,    // Singular model name as per your schema
            comments: true  // Singular model name as per your schema
          }
        }
      }
    });

    if (!opinion) {
      return res.status(404).json({ success: false, message: 'Opinion not found' });
    }

    // Check if current user has liked this opinion
    let isLiked = false;
    if ((req.user as { id: string })?.id) {
      const like = await prisma.like.findFirst({
        where: {
          opinionId: id,
          userId: (req.user as { id: string })?.id
        }
      });
      isLiked = !!like;
    }

    return res.status(200).json({
      success: true,
      message: 'Opinion retrieved successfully',
      data: {
        ...opinion,
        likesCount: opinion._count?.likes || 0,      // Use singular model name
        commentsCount: opinion._count?.comments || 0, // Use singular model name
        isLiked
      }
    });

  } catch (error) {
    console.error('Error fetching opinion:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error
    });
  }
};
// Get All Opinions with Pagination



export const getOpinions = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: Prisma.OpinionWhereInput = search
      ? {
        OR: [
          { title: { contains: search as string, mode: 'insensitive' } },
          { content: { contains: search as string, mode: 'insensitive' } }
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

  } catch (error) {
    console.error('Error fetching opinions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error
    });
  }
};



// Get Related Opinions
export const getRelatedOpinions = async (req: Request, res: Response): Promise<any> => {
  try {
    const { currentId } = req.query;

    const opinions = await prisma.opinion.findMany({
      take: 4,
      where: {
        NOT: { id: currentId as string }
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

  } catch (error) {
    console.error('Error fetching related opinions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error
    });
  }
};

// Update Opinion
export const updateOpinion = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      category,
      subCategory,
      imageSource,
      imageTitle,
      keywords,
      subKeywords,
      imageUrl,
      authorId
    } = req.body;

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

  } catch (error) {
    console.error('Error updating opinion:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error
    });
  }
};

// Delete Opinion
export const deleteOpinion = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { authorId } = req.body;

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

  } catch (error) {
    console.error('Error deleting opinion:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error
    });
  }
};



















export const getAllOpinions = async (req: Request, res: Response):Promise<any> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const where: any = {};
    if (status) where.status = status;

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
  } catch (error) {
    console.error('Error fetching opinions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateOpinionStatus = async (req: Request, res: Response):Promise<any> => {
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
    emitToUser(opinion.authorId, 'opinion_status_update', {
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
  } catch (error) {
    console.error('Error updating opinion status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};



export const createOpinion = async (req: Request, res: Response):Promise<any> => {
  try {
    const {
      title,
      content,
      category,
      subCategory,
      imageSource = "Unknown",
      imageTitle = "Untitled",
      keywords = [],
      subKeywords = [],
      imageUrl,
    } = req.body;

    const authorId = (req.user as {id:string}).id;

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
        message: `New opinion submitted by ${(req.user as {name:string}).name}: "${opinion.title}"`,
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
    emitToAdmins('new_admin_notification', notification);

    // Update admin count
    const adminUnreadCount = await prisma.notification.count({
      where: {
        type: 'OPINION_SUBMITTED',
        read: false
      }
    });

    emitToAdmins('admin_notification_count', { count: adminUnreadCount });

    return res.status(201).json({
      success: true,
      message: 'Opinion created successfully',
      data: opinion
    });
  } catch (error) {
    console.error('Error creating opinion:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};





export const getOpinionByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        opinions: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    const opinions = user.opinions.map(opinion => ({
      id: opinion.id,
      name: user.name,
      email: user.email,
      title: opinion.title,
      status: opinion.status,
      createdAt: opinion.createdAt,
      updatedAt: opinion.updatedAt,
    }));

    return res.status(200).json(opinions);
  } catch (error) {
    console.error('Error fetching opinions by email:', error);
    return res.status(500).json({ message: 'Server Error', error });
  }
};
