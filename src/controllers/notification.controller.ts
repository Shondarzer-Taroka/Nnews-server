import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: (req.user as {id:string}).id,
        type: { in: ['OPINION_APPROVED', 'OPINION_REJECTED', 'SYSTEM_MESSAGE'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: (req.user as {id:string}).id,
        read: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: {
      userId: (req.user as {id:string}).id,
        read: false
      },
      data: {
        read: true
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markSingleAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: req.params.id,
            userId: (req.user as {id:string}).id,
      },
      data: {
        read: true
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserNotificationsById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid userId' });
    }

    if ((req.user as {id:string}).id !== userId && (req.user as {role:string}).role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        type: { in: ['OPINION_APPROVED', 'OPINION_REJECTED', 'SYSTEM_MESSAGE'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    if ((req.user as {role: string}).role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { type: 'OPINION_SUBMITTED' },
          { type: 'SYSTEM_MESSAGE' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        opinion: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminUnreadCount = async (req: Request, res: Response) => {
  try {
    if ((req.user as {role: string}).role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const count = await prisma.notification.count({
      where: {
        type: 'OPINION_SUBMITTED',
        read: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching admin unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


