import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

interface NewsData {
  title: string;
  content: string;
  category: string;
  imageSource: string;
  imageTitle: string;
  subCategory: string;
  keywords: string[];
  subKeywords: string[];
  imageUrl?: string;
  author: {
    name: string;
    email: string;
    image?: string;
  };
}

export const createNews = async (req: Request, res: Response):Promise<any> => {
    console.log(req.body);
    
  try {
    const { 
      title, 
      content, 
      category, 
      subCategory, 
      keywords, 
      subKeywords, 
      imageUrl,
      imageSource,
      imageTitle,
      author 
    }: NewsData = req.body;

    console.log(req.body);
    

    // Validate required fields
    if (!title || !content || !category || !subCategory || !author?.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if author exists
    const existingAuthor = await prisma.user.findUnique({
      where: { email: author.email },
    });

    if (!existingAuthor) {
      return res.status(404).json({ error: 'Author not found' });
    }

    // Create news with all the fields
    const news = await prisma.news.create({
      data: {
        title,
        content,
        category,
        subCategory,
        keywords,
        subKeywords,
        imageSource,
        imageTitle,
        imageUrl: imageUrl || null,
        authorId: existingAuthor.id,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return res.status(201).json({ 
      message: 'News created successfully',
      news 
    });

  } catch (error) {
    console.error('Error creating news:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNews = async (req: Request, res: Response):Promise<any> => {
  try {
    const news = await prisma.news.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({ news });

  } catch (error) {
    console.error('Error fetching news:', error);
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
};

export const getSingleNews = async (req: Request, res: Response):Promise<any>=> {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'News ID is required' });
    }

    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    return res.status(200).json({ news });

  } catch (error) {
    console.error('Error fetching news:', error);
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
};

export const deleteNews = async (req: Request, res: Response) :Promise<any>=> {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'News ID is required' });
    }

    // Check if news exists
    const existingNews = await prisma.news.findUnique({ 
      where: { id } 
    });

    if (!existingNews) {
      return res.status(404).json({ error: 'News not found' });
    }

    // Delete the news
    const deletedNews = await prisma.news.delete({ 
      where: { id } 
    });

    return res.status(200).json({ 
      message: 'News deleted successfully',
      news: deletedNews
    });

  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'News not found' });
    }
    
    console.error('Error deleting news:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      content, 
      category, 
      subCategory, 
      keywords, 
      subKeywords, 
      imageUrl 
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'News ID is required' });
    }

    // Check if news exists
    const existingNews = await prisma.news.findUnique({ 
      where: { id } 
    });

    if (!existingNews) {
      return res.status(404).json({ error: 'News not found' });
    }

    // Update news
    const updatedNews = await prisma.news.update({
      where: { id },
      data: {
        title: title || existingNews.title,
        content: content || existingNews.content,
        category: category || existingNews.category,
        subCategory: subCategory || existingNews.subCategory,
        keywords: keywords || existingNews.keywords,
        subKeywords: subKeywords || existingNews.subKeywords,
        imageUrl: imageUrl || existingNews.imageUrl
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return res.status(200).json({ 
      message: 'News updated successfully',
      news: updatedNews
    });

  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'News not found' });
    }
    
    console.error('Error updating news:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};