// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';


// const prisma = new PrismaClient();

// export const getDashboardOverView = async (req: Request, res: Response) => {
//     try {

//     } catch (error) {

//     }
// }




















// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// interface TimePeriodCount {
//   day: number;
//   week: number;
//   month: number;
//   year: number;
// }

// interface DashboardData {
//   users: TimePeriodCount;
//   news: TimePeriodCount;
//   polls: TimePeriodCount;
//   epapers: TimePeriodCount;
//   opinions: TimePeriodCount;
//   comments: TimePeriodCount;
//   likes: TimePeriodCount;
// }

// interface HistoricalDataPoint {
//   month: string;
//   users: number;
//   news: number;
//   opinions: number;
//   comments: number;
//   likes: number;
// }

// export const getDashboardOverView = async (req: Request, res: Response) => {
//   try {
//     const now = new Date();
//     const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//     const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//     const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//     const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

//     const getCounts = async (model: keyof typeof prisma, where = {}) => {
//       return {
//         day: await prisma[model].count({ where: { ...where, createdAt: { gte: oneDayAgo } } }),
//         week: await prisma[model].count({ where: { ...where, createdAt: { gte: oneWeekAgo } } }),
//         month: await prisma[model].count({ where: { ...where, createdAt: { gte: oneMonthAgo } } }),
//         year: await prisma[model].count({ where: { ...where, createdAt: { gte: oneYearAgo } } }),
//       };
//     };

//     const dashboardData: DashboardData = {
//       users: await getCounts('user'),
//       news: await getCounts('news'),
//       polls: await getCounts('poll'),
//       epapers: await getCounts('epaper'),
//       opinions: await getCounts('opinion'),
//       comments: await getCounts('comment'),
//       likes: await getCounts('like'),
//     };

//     res.json(dashboardData);
//   } catch (error) {
//     console.error('Error fetching dashboard data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const getHistoricalData = async (req: Request, res: Response) => {
//   try {
//     const months = 6;
//     const historicalData: HistoricalDataPoint[] = [];
//     const now = new Date();
    
//     for (let i = months - 1; i >= 0; i--) {
//       const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
//       const monthName = startDate.toLocaleString('default', { month: 'short' });
      
//       const [users, news, opinions, comments, likes] = await Promise.all([
//         prisma.user.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
//         prisma.news.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
//         prisma.opinion.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
//         prisma.comment.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
//         prisma.like.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
//       ]);
      
//       historicalData.push({
//         month: monthName,
//         users,
//         news,
//         opinions,
//         comments,
//         likes,
//       });
//     }
    
//     res.json(historicalData);
//   } catch (error) {
//     console.error('Error fetching historical data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };









import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TimePeriodCount {
  day: number;
  week: number;
  month: number;
  year: number;
}

interface DashboardData {
  users: TimePeriodCount;
  news: TimePeriodCount;
  polls: TimePeriodCount;
  epapers: TimePeriodCount;
  opinions: TimePeriodCount;
  comments: TimePeriodCount;
  likes: TimePeriodCount;
}








interface HistoricalDataPoint {
  month: string;
  users: number;
  news: number;
  opinions: number;
  comments: number;
  likes: number;
}

// 👇 Map keys to actual Prisma model delegates
const modelMap = {
  user: prisma.user,
  news: prisma.news,
  poll: prisma.poll,
  ePaper: prisma.ePaper, // ✅ use correct casing from your schema
  opinion: prisma.opinion,
  comment: prisma.comment,
  like: prisma.like,
};

type ModelKey = keyof typeof modelMap;

const getCounts = async (model: ModelKey): Promise<TimePeriodCount> => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  // 👇 Safely cast to `any` to avoid union signature confusion
  const delegate = modelMap[model] as any;

  return {
    day: await delegate.count({ where: { createdAt: { gte: oneDayAgo } } }),
    week: await delegate.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    month: await delegate.count({ where: { createdAt: { gte: oneMonthAgo } } }),
    year: await delegate.count({ where: { createdAt: { gte: oneYearAgo } } }),
  };
};


export const getDashboardOverView = async (req: Request, res: Response) => {
  try {
    const dashboardData: DashboardData = {
      users: await getCounts('user'),
      news: await getCounts('news'),
      polls: await getCounts('poll'),
      epapers: await getCounts('ePaper'), // ✅ CORRECT KEY
      opinions: await getCounts('opinion'),
      comments: await getCounts('comment'),
      likes: await getCounts('like'),
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};







export const getHistoricalData = async (req: Request, res: Response) => {
  try {
    const months = 6;
    const historicalData: HistoricalDataPoint[] = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthName = startDate.toLocaleString('default', { month: 'short' });
      
      const [users, news, opinions, comments, likes] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        prisma.news.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        prisma.opinion.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        prisma.comment.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        prisma.like.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      ]);
      
      historicalData.push({
        month: monthName,
        users,
        news,
        opinions,
        comments,
        likes,
      });
    }
    
    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};






