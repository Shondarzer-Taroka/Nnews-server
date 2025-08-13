import { Request, Response } from 'express';
import { PrismaClient,NotificationType } from '@prisma/client';
import { emitToAdmins, emitToUser } from '../app';

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


export const markSingleAsRead = async (req: Request, res: Response):Promise<any>=> {
  try {
    // First verify the notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check ownership (admin can mark any as read, users only their own)
    if (notification.userId !== (req.user as {id: string}).id && 
        (req.user as {role: string}).role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Only update if not already read
    if (!notification.read) {
      await prisma.notification.update({
        where: { id: req.params.id },
        data: { read: true }
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: Request, res: Response):Promise<any> => {
  try {
    const userId = (req.user as {id: string}).id;
    const isAdmin = (req.user as {role: string}).role === 'admin';

    const whereClause = isAdmin 
      ? { read: false } 
      : { userId, read: false };

    await prisma.notification.updateMany({
      where: whereClause,
      data: { read: true }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};








export const createNotification = async (
  userId: string,
  type: NotificationType,
  message: string,
  opinionId?: string
) => {
  const notification = await prisma.notification.create({
    data: {
      type,           // Now correctly typed
      message,
      userId,
      opinionId,
      read: false
    },
    include: {
      user: {
        select: {
          name: true,
          role: true
        }
      },
      opinion: {
        select: {
          title: true
        }
      }
    }
  });

  // Emit to the specific user
  emitToUser(userId, 'new_notification', notification);

  // If it's an admin notification, emit to admin room
  if (type === NotificationType.OPINION_SUBMITTED) {
    const unreadCount = await prisma.notification.count({
      where: {
        type: NotificationType.OPINION_SUBMITTED,
        read: false
      }
    });
    emitToAdmins('admin_notification_count', { count: unreadCount });
  }

  return notification;
};

