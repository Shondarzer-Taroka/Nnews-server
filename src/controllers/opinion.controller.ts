// // backend/src/controller/opinion.controller.ts
// import { PrismaClient } from '@prisma/client';

// import { Request, Response } from 'express';

// const prisma = new PrismaClient();
// export const createOpinion = async (req: Request, res: Response):Promise<any> => {
//   try {
//     const { title, content, imageUrl, authorId } = req.body;

//     // Validate required fields
//     if (!title || !content || !authorId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Title, content, and authorId are required'
//       });
//     }

//     // Check if user exists
//     const userExists = await prisma.user.findUnique({
//       where: { id: authorId }
//     });

//     if (!userExists) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Create opinion
//     const opinion = await prisma.opinion.create({
//       data: {
//         title,
//         content,
//         imageUrl,
//         authorId
//       },
//       include: {
//         author: {
//           select: {
//             id: true,
//             name: true,
//             email: true
//           }
//         }
//       }
//     });

//     return res.status(201).json({
//       success: true,
//       message: 'Opinion created successfully',
//       data: opinion
//     });

//   } catch (error) {
//     console.error('Error creating opinion:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error instanceof Error ? error.message : error
//     });
//   }
// };

// // Add other CRUD operations as needed (getOpinions, getOpinionById, etc.)












// backend/src/controller/opinion.controller.ts
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Create Opinion
export const createOpinion = async (req: Request, res: Response): Promise<any> => {
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

// Get Single Opinion
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
        }
      }
    });

    if (!opinion) {
      return res.status(404).json({
        success: false,
        message: 'Opinion not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Opinion retrieved successfully',
      data: opinion
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
// Get All Opinions with Pagination
export const getOpinions = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Fixed where clause with proper typing
    const whereClause = search ? {
      OR: [
        { title: { contains: search as string, mode: 'insensitive' as const } },
        { content: { contains: search as string, mode: 'insensitive' as const } }
      ]
    } : {};

    const [opinions, total] = await Promise.all([
      prisma.opinion.findMany({
        skip,
        take: limitNumber,
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
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
        NOT: {
          id: currentId as string
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
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
    const { title, content, imageUrl, authorId } = req.body;

    // Check if opinion exists and belongs to the author
    const existingOpinion = await prisma.opinion.findUnique({
      where: { id }
    });

    if (!existingOpinion) {
      return res.status(404).json({
        success: false,
        message: 'Opinion not found'
      });
    }

    if (existingOpinion.authorId !== authorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this opinion'
      });
    }

    // Update opinion
    const updatedOpinion = await prisma.opinion.update({
      where: { id },
      data: {
        title: title || existingOpinion.title,
        content: content || existingOpinion.content,
        imageUrl: imageUrl || existingOpinion.imageUrl
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
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

    // Check if opinion exists and belongs to the author
    const existingOpinion = await prisma.opinion.findUnique({
      where: { id }
    });

    if (!existingOpinion) {
      return res.status(404).json({
        success: false,
        message: 'Opinion not found'
      });
    }

    if (existingOpinion.authorId !== authorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this opinion'
      });
    }

    // Delete opinion
    await prisma.opinion.delete({
      where: { id }
    });

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