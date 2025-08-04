// // // // backend/src/controller/likeComment.controller.ts
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

enum EntityType {
  OPINION = 'opinion',
  NEWS = 'news'
}

interface LikeParams {
  entityId: string;
  entityType: EntityType;
}


interface LikeParams {
  entityId: string;
  entityType: EntityType;
}

function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

// Helper function to validate entity
async function validateEntity(entityId: string, entityType: EntityType) {
  if (entityType === EntityType.OPINION) {
    return await prisma.opinion.findUnique({
      where: { id: entityId },
      select: { id: true }
    });
  } else if (entityType === EntityType.NEWS) {
    return await prisma.news.findUnique({
      where: { id: entityId },
      select: { id: true }
    });
  }
  return null;
}

// Helper function to get like count
async function getLikeCount(entityId: string, entityType: EntityType) {
  return await prisma.like.count({
    where: {
      [entityType === EntityType.OPINION ? 'opinionId' : 'newsId']: entityId
    }
  });
}

// Helper function to get user like status (Type-safe fix)
async function getUserLikeStatus(userId: string, entityId: string, entityType: EntityType) {
  if (entityType === EntityType.OPINION) {
    return await prisma.like.findUnique({
      where: {
        userId_opinionId: {
          userId,
          opinionId: entityId
        }
      }
    });
  } else {
    return await prisma.like.findUnique({
      where: {
        userId_newsId: {
          userId,
          newsId: entityId
        }
      }
    });
  }
}

// Toggle like (fixed)
export const toggleLike = async (req: Request, res: Response): Promise<any> => {
  try {
    const { entityId, entityType } = req.params as unknown as LikeParams;
    const userId = (req.user as { id: string })?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to like'
      });
    }

    if (!entityId || !isValidUUID(entityId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid entity ID'
      });
    }

    if (!Object.values(EntityType).includes(entityType as EntityType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid entity type'
      });
    }

    const entityExists = await validateEntity(entityId, entityType as EntityType);
    if (!entityExists) {
      return res.status(404).json({
        success: false,
        error: 'Entity not found'
      });
    }

    const existingLike = await getUserLikeStatus(userId, entityId, entityType as EntityType);

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });

      const likeCount = await getLikeCount(entityId, entityType as EntityType);
      return res.json({
        success: true,
        liked: false,
        likeCount,
        message: 'Like removed successfully'
      });
    } else {
      await prisma.like.create({
        data: {
          userId,
          [entityType === EntityType.OPINION ? 'opinionId' : 'newsId']: entityId
        }
      });

      const likeCount = await getLikeCount(entityId, entityType as EntityType);
      return res.json({
        success: true,
        liked: true,
        likeCount,
        message: 'Like added successfully'
      });
    }
  } catch (error) {
    console.error('Like error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process like action'
    });
  }
};







// Generic get like status
export const getLikeStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { entityId, entityType } = req.params as unknown as LikeParams;
    const userId = (req.user as { id: string })?.id;

    if (!entityId || !isValidUUID(entityId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid entity ID'
      });
    }

    if (!Object.values(EntityType).includes(entityType as EntityType)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid entity type'
      });
    }

    const entityExists = await validateEntity(entityId, entityType as EntityType);
    if (!entityExists) {
      return res.status(404).json({ 
        success: false,
        error: 'Entity not found'
      });
    }

    const likeCount = await getLikeCount(entityId, entityType as EntityType);

    let liked = false;
    if (userId) {
      const userLike = await getUserLikeStatus(userId, entityId, entityType as EntityType);
      liked = !!userLike;
    }

    return res.json({ 
      success: true,
      liked, 
      likeCount,
      message: 'Like status retrieved successfully'
    });
  } catch (error) {
    console.error('Like status error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to get like status'
    });
  }
};

// Generic create comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { entityId, entityType } = req.params as unknown as LikeParams;
    const { content } = req.body;
     
    // Validate entity ID
    if (!entityId || !isValidUUID(entityId)) {
      return res.status(400).json({ error: 'Invalid entity ID' });
    }

    if (!Object.values(EntityType).includes(entityType as EntityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ error: 'Comment must be less than 1000 characters' });
    }

    // Check authentication
    if (! (req.user as { id: string })?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if entity exists
    const entityExists = await validateEntity(entityId, entityType as EntityType);
    if (!entityExists) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: (req.user as { id: string })?.id,
        [entityType === EntityType.OPINION ? 'opinionId' : 'newsId']: entityId
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

    const commentCount = await prisma.comment.count({ 
      where: { [entityType === EntityType.OPINION ? 'opinionId' : 'newsId']: entityId }
    });
    
    res.status(201).json({ comment, commentCount });

  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generic get comments
export const getComments = async (req: Request, res: Response) => {
  try {
    const { entityId, entityType } = req.params as unknown as LikeParams;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    // Validate entity ID
    if (!entityId || !isValidUUID(entityId)) {
      return res.status(400).json({ error: 'Invalid entity ID' });
    }

    if (!Object.values(EntityType).includes(entityType as EntityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    // Validate pagination
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    // Get comments
    const comments = await prisma.comment.findMany({
      where: { [entityType === EntityType.OPINION ? 'opinionId' : 'newsId']: entityId },
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

    const totalComments = await prisma.comment.count({ 
      where: { [entityType === EntityType.OPINION ? 'opinionId' : 'newsId']: entityId }
    });
    const hasMore = skip + limit < totalComments;

    res.json({
      comments,
      totalComments,
      hasMore,
      nextPage: hasMore ? page + 1 : null
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generic update comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = (req.user as { id: string })?.id;
 
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
      select: { id: true, userId: true, opinionId: true, newsId: true }
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
    const entityField = existingComment.opinionId ? 'opinionId' : 'newsId';
    const entityId = existingComment[entityField];
    
    const commentCount = await prisma.comment.count({ 
      where: { [entityField]: entityId } 
    });

    res.json({ 
      comment: updatedComment,
      commentCount
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generic delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = (req.user as { id: string })?.id;

    // Validate comment ID
    if (!commentId || !isValidUUID(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, opinionId: true, newsId: true }
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
    const entityField = existingComment.opinionId ? 'opinionId' : 'newsId';
    const entityId = existingComment[entityField];
    
    const commentCount = await prisma.comment.count({ 
      where: { [entityField]: entityId } 
    });

    res.json({ 
      success: true,
      commentCount
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
