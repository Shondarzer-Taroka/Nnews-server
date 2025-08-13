
// src/controllers/epaper.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { EpaperData, EpaperResponse, PaginatedEpaperResponse } from '../types/epaper.types';

const prisma = new PrismaClient();


type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    // optionally add name, email, etc.
  };
};

const verifyAuthenticatedUser = (req: AuthenticatedRequest) => {
  if (!req.user || !req.user.id) {
    throw new Error('Unauthorized - User not authenticated');
  }
  return req.user.id;
};





export const addManyData = async (req: Request, res: Response):Promise<any> => {
  try {
    const epaperData = req.body;

    
    if (!Array.isArray(epaperData) || epaperData.length === 0) {
      return res.status(400).json({ message: 'Invalid input. Expected a non-empty array.' });
    }

    const result = await prisma.ePaper.createMany({
      data: epaperData,
      skipDuplicates: true, // optional: ignores duplicate entries based on unique constraints
    });

    return res.status(201).json({
      message: 'Successfully inserted multiple ePapers.',
      count: result.count,
    });
  } catch (error: any) {
    console.error('Error in addManyData:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




// Create a new e-paper
export const createEpaper = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = verifyAuthenticatedUser(req);
    const epaperData: EpaperData = req.body;
    console.log(epaperData, 'epaper');

    // Validate input data
    if (!epaperData.mainEpaperImage || !epaperData.date || !epaperData.articles || epaperData.articles.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate each article
    for (const article of epaperData.articles) {
      if (!article.title || !article.content || !article.category || !article.pageNumber) {
        return res.status(400).json({ error: 'All articles must have title, content, category, and pageNumber' });
      }
    }

    // Create the e-paper
    const newEpaper = await prisma.ePaper.create({
      data: {
        mainEpaperImage: epaperData.mainEpaperImage,
        date: new Date(epaperData.date),
        userId: userId,
        articles: {
          create: epaperData.articles.map(article => ({
            title: article.title,
            contentImage: article.contentImage,
            content: article.content,
            bboxX: article.bbox.x,
            bboxY: article.bbox.y,
            bboxWidth: article.bbox.width,
            bboxHeight: article.bbox.height,
            category: article.category,
            isLeading: article.isLeading || false,
            pageNumber: article.pageNumber || 1
          }))
        }
      },
      include: {
        articles: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const response: EpaperResponse = {
      ...newEpaper,
      date: newEpaper.date,
      createdAt: newEpaper.createdAt,
      updatedAt: newEpaper.updatedAt,
      articles: newEpaper.articles.map(article => ({
        ...article,
        bbox: {
          x: article.bboxX,
          y: article.bboxY,
          width: article.bboxWidth,
          height: article.bboxHeight
        },
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      }))
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized - User not authenticated') {
      return res.status(401).json({ error: error.message });
    }
    console.error('Error creating e-paper:', error);
    res.status(500).json({ error: 'Failed to create e-paper' });
  }
};



// Update an e-paper
export const updateEpaper = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    console.log(req.body, 'upda epa');

    const { id } = req.params;
    const userId = verifyAuthenticatedUser(req);
    const epaperData: EpaperData = req.body;

    // Check if e-paper exists and belongs to the user
    const existingEpaper = await prisma.ePaper.findUnique({
      where: { id: Number(id) },
      include: { articles: true }
    });

    if (!existingEpaper) {
      return res.status(404).json({ error: 'E-paper not found' });
    }

    if (existingEpaper.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this e-paper' });
    }


    // Validate input data
    if (!epaperData.mainEpaperImage || !epaperData.date || !epaperData.articles || epaperData.articles.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate each article
    for (const article of epaperData.articles) {
      if (!article.title || !article.content || !article.category || !article.pageNumber) {
        return res.status(400).json({ error: 'All articles must have title, content, category, and pageNumber' });
      }
    }

    // Delete existing articles
    await prisma.article.deleteMany({
      where: { epaperId: Number(id) }
    });


    // Update the e-paper with new data
    const updatedEpaper = await prisma.ePaper.update({
      where: { id: Number(id) },
      data: {
        mainEpaperImage: epaperData.mainEpaperImage,
        date: new Date(epaperData.date),
        articles: {
          create: epaperData.articles.map(article => ({
            title: article.title,
            contentImage: article.contentImage,
            content: article.content,
            bboxX: article.bbox.x,
            bboxY: article.bbox.y,
            bboxWidth: article.bbox.width,
            bboxHeight: article.bbox.height,
            category: article.category,
            isLeading: article.isLeading || false,
            pageNumber: article.pageNumber || 1
          }))
        }
      },
      include: {
        articles: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const response: EpaperResponse = {
      ...updatedEpaper,
      date: updatedEpaper.date,
      createdAt: updatedEpaper.createdAt,
      updatedAt: updatedEpaper.updatedAt,
      articles: updatedEpaper.articles.map(article => ({
        ...article,
        bbox: {
          x: article.bboxX,
          y: article.bboxY,
          width: article.bboxWidth,
          height: article.bboxHeight
        },
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      }))
    };
    console.log(response, 'up response');

    res.json(response);

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized - User not authenticated') {
      return res.status(401).json({ error: error.message });
    }
    console.error('Error updating e-paper:', error);
    res.status(500).json({ error: 'Failed to update e-paper' });
  }
};


// Delete an e-paper
export const deleteEpaper = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = verifyAuthenticatedUser(req);

    const existingEpaper = await prisma.ePaper.findUnique({
      where: { id: Number(id) }
    });

    if (!existingEpaper) {
      return res.status(404).json({ error: 'E-paper not found' });
    }

    if (existingEpaper.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this e-paper' });
    }

    await prisma.ePaper.delete({
      where: { id: Number(id) }
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized - User not authenticated') {
      return res.status(401).json({ error: error.message });
    }
    console.error('Error deleting e-paper:', error);
    res.status(500).json({ error: 'Failed to delete e-paper' });
  }
};




// Get all e-papers with pagination
export const getAllEpapers = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [epapers, total] = await Promise.all([
      prisma.ePaper.findMany({
        skip,
        take: limitNum,
        orderBy: {
          date: 'desc'
        },
        include: {
          articles: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.ePaper.count()
    ]);

    const response: PaginatedEpaperResponse = {
      data: epapers.map(epaper => ({
        ...epaper,
        date: epaper.date,
        createdAt: epaper.createdAt,
        updatedAt: epaper.updatedAt,
        articles: epaper.articles.map(article => ({
          ...article,
          bbox: {
            x: article.bboxX,
            y: article.bboxY,
            width: article.bboxWidth,
            height: article.bboxHeight
          },
          createdAt: article.createdAt,
          updatedAt: article.updatedAt
        }))
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching e-papers:', error);
    res.status(500).json({ error: 'Failed to fetch e-papers' });
  }
};









// Get a single e-paper by ID
export const getEpaperById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    console.log(id, 'jl');


    const epaper = await prisma.ePaper.findUnique({
      where: { id: Number(id) },
      include: {
        articles: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!epaper) {
      return res.status(404).json({ error: 'E-paper not found' });
    }

    const response: EpaperResponse = {
      ...epaper,
      date: epaper.date,
      createdAt: epaper.createdAt,
      updatedAt: epaper.updatedAt,
      articles: epaper.articles.map(article => ({
        ...article,
        bbox: {
          x: article.bboxX,
          y: article.bboxY,
          width: article.bboxWidth,
          height: article.bboxHeight
        },
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      }))
    };

    console.log(response, 'd');


    res.json(response);
  } catch (error) {
    console.error('Error fetching e-paper:', error);
    res.status(500).json({ error: 'Failed to fetch e-paper' });
  }
};



// Get e-papers by date range
export const getEpapersByDateRange = async (req: Request, res: Response): Promise<any> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required' });
    }

    const epapers = await prisma.ePaper.findMany({
      where: {
        date: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      orderBy: {
        date: 'desc'
      },
      include: {
        articles: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const response: EpaperResponse[] = epapers.map(epaper => ({
      ...epaper,
      date: epaper.date,
      createdAt: epaper.createdAt,
      updatedAt: epaper.updatedAt,
      articles: epaper.articles.map(article => ({
        ...article,
        bbox: {
          x: article.bboxX,
          y: article.bboxY,
          width: article.bboxWidth,
          height: article.bboxHeight
        },
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      }))
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching e-papers by date range:', error);
    res.status(500).json({ error: 'Failed to fetch e-papers' });
  }
};

// Get latest e-papers
export const getLatestEpapers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { limit = '5' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const epapers = await prisma.ePaper.findMany({
      take: limitNum,
      orderBy: {
        date: 'desc'
      },
      include: {
        articles: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const response: EpaperResponse[] = epapers.map(epaper => ({
      ...epaper,
      date: epaper.date,
      createdAt: epaper.createdAt,
      updatedAt: epaper.updatedAt,
      articles: epaper.articles.map(article => ({
        ...article,
        bbox: {
          x: article.bboxX,
          y: article.bboxY,
          width: article.bboxWidth,
          height: article.bboxHeight
        },
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      }))
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching latest e-papers:', error);
    res.status(500).json({ error: 'Failed to fetch latest e-papers' });
  }
};



