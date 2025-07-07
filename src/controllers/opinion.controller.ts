// backend/src/controller/opinion.controller.ts
import { PrismaClient } from '@prisma/client';

import { Request, Response } from 'express';

const prisma = new PrismaClient();
export const createOpinion = async (req: Request, res: Response) => {
  try {
    const { title, content, imageUrl, authorId } = req.body;

    // Validate required fields
    if (!title || !content || !authorId) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and authorId are required'
      });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: authorId }
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create opinion
    const opinion = await prisma.opinion.create({
      data: {
        title,
        content,
        imageUrl,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Opinion created successfully',
      data: opinion
    });

  } catch (error) {
    console.error('Error creating opinion:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error
    });
  }
};

// Add other CRUD operations as needed (getOpinions, getOpinionById, etc.)