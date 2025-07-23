// backend/src/routes/notification.routes.ts

import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';

const prisma = new PrismaClient();
const router = express.Router();

// Get user notifications
router.get('/', async (req: Request, res: Response):Promise<any> => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId as string,
        isAdmin: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.status(200).json({ success: true, notifications });
  } catch (error: any) {
    console.error('Error fetching notifications:', error.message || error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get admin notifications
router.get('/admin', async (req: Request, res: Response):Promise<any> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { isAdmin: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.status(200).json({ success: true, notifications });
  } catch (error: any) {
    console.error('Error fetching admin notifications:', error.message || error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user unread count
router.get('/unread-count', async (req: Request, res: Response):Promise<any> => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const count = await prisma.notification.count({
      where: {
        userId: userId as string,
        isRead: false,
        isAdmin: false,
      },
    });

    return res.status(200).json({ success: true, count });
  } catch (error: any) {
    console.error('Error fetching unread count:', error.message || error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get admin unread count
router.get('/admin/unread-count', async (req: Request, res: Response):Promise<any> => {
  try {
    const count = await prisma.notification.count({
      where: {
        isRead: false,
        isAdmin: true,
      },
    });

    return res.status(200).json({ success: true, count });
  } catch (error: any) {
    console.error('Error fetching admin unread count:', error.message || error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Mark user notifications as read
router.post('/mark-as-read', async (req: Request, res: Response):Promise<any> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        isAdmin: false,
      },
      data: { isRead: true },
    });

    return res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    console.error('Error marking notifications as read:', error.message || error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Mark admin notifications as read
router.post('/admin/mark-as-read', async (req: Request, res: Response):Promise<any> => {
  try {
    await prisma.notification.updateMany({
      where: {
        isRead: false,
        isAdmin: true,
      },
      data: { isRead: true },
    });

    return res.status(200).json({ success: true, message: 'Admin notifications marked as read' });
  } catch (error: any) {
    console.error('Error marking admin notifications as read:', error.message || error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
