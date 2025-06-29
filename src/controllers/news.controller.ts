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

export const createNews = async (req: Request, res: Response): Promise<any> => {
  console.log(req.body, 'news creatae');

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

export const getNews = async (req: Request, res: Response): Promise<any> => {
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

export const getSingleNews = async (req: Request, res: Response): Promise<any> => {
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

export const deleteNews = async (req: Request, res: Response): Promise<any> => {
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




export const addManyData = async (req: Request, res: Response): Promise<any> => {
  try {
    const newsItems = req.body;

    if (!Array.isArray(newsItems)) {
      return res.status(400).json({ message: 'Request body must be an array' });
    }

    // Ensure no relation objects like `author` are passed
    const result = await prisma.news.createMany({
      data: newsItems.map(({ author, ...rest }) => rest), // safely exclude `author` if mistakenly present
      skipDuplicates: true,
    });

    res.status(201).json({ message: 'Inserted successfully', insertedCount: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};







export const deleteAllNews = async (req: Request, res: Response): Promise<any> => {
  try {
    await prisma.news.deleteMany(); // ⚠️ Deletes all records

    res.status(200).json({ message: 'All news entries deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};








export const getHomePageNews = async (req: Request, res: Response) => {
  try {
    // Special news (latest single news)
    const specialNews = await prisma.news.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // National News (latest 5)
    const nationalNews = await prisma.news.findMany({
      where: {
        OR: [
          { category: 'জাতীয়' },
          { subCategory: 'জাতীয়' },
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Whole Country (সারাদেশ) - latest 9
    const wholeCountry = await prisma.news.findMany({
      where: {
        OR: [
          { category: 'সারাদেশ' },
          { subCategory: 'সারাদেশ' },
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 9,
    });

    // Political News (রাজনীতি) - latest 4
    const politicalNews = await prisma.news.findMany({
      where: {
        OR: [
          { category: 'রাজনীতি' },
          { subCategory: 'রাজনীতি' },
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    // International News (আন্তর্জাতিক) - latest 6
    const internationalNews = await prisma.news.findMany({
      where: {
        OR: [
          { category: 'আন্তর্জাতিক' },
          { subCategory: 'আন্তর্জাতিক' },
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    // Entertainment News (বিনোদন) - latest 7
    const entertainment = await prisma.news.findMany({
      where: {
        OR: [
          { category: 'বিনোদন' },
          { subCategory: 'বিনোদন' },
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 7,
    });

    // Encouraging (উৎসাহ) - all matching
    const encouraging = await prisma.news.findMany({
      where: {
        OR: [
          { category: 'উৎসাহ' },
          { subCategory: 'উৎসাহ' },
        ]
      },
      orderBy: { createdAt: 'desc' },
    });



    const sports = await prisma.news.findMany({
      where: {
        OR: [
          { category: 'খেলাধুলা' },
          { subCategory: 'খেলাধুলা' },
        ]
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    // Final response
    res.status(200).json({
      specialNews,
      nationalNews,
      wholeCountry,
      politicalNews,
      internationalNews,
      entertainment,
      sports,
      encouraging,
    });
  } catch (error) {
    console.error('Failed to fetch homepage news:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error,
    });
  }
};



export const getTitleForDescription = async (req: Request, res: Response) => {
  try {
    const category = req.params.category
    const news = await prisma.news.findMany({
      where: {
        OR: [
          { category: category },
          { subCategory: category },
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 7
    })

    res.status(200).json({
      categorizedNews: news
    })
  } catch (error) {
    console.error('Failed to fetch homepage news:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error,
    });
  }
}




// =========================
// ✅ BACKEND CONTROLLER
// =========================
// File: controllers/newsController.ts

export const getCategorizedNews = async (req: Request, res: Response) => {
  try {
    const { category } = req.params
    const skip = parseInt(req.query.skip as string) || 0
    const take = parseInt(req.query.take as string) || 15

    const decodedCategory = req.params.category
    // const decodedCategory = decodeURIComponent(category)
    // console.log(decodedCategory);
    
    const news = await prisma.news.findMany({
      where: {
        OR: [
          { category: decodedCategory },
          { subCategory: decodedCategory },
        ]
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    const totalCount = await prisma.news.count({
      where: {
        OR: [
          { category: decodedCategory },
          { subCategory: decodedCategory },
        ]
      }
    })

    res.status(200).json({
      success: true,
      data: news,
      hasMore: skip + take < totalCount,
      totalCount
    })
  } catch (error) {
    console.error(`Failed to fetch categorized news:`, error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}





