"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = exports.markAllAsRead = exports.markSingleAsRead = exports.getAdminUnreadCount = exports.getAdminNotifications = exports.getUserNotificationsById = exports.getUnreadCount = exports.getUserNotifications = void 0;
const client_1 = require("@prisma/client");
const app_1 = require("../app");
const prisma = new client_1.PrismaClient();
const getUserNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: req.user.id,
                type: { in: ['OPINION_APPROVED', 'OPINION_REJECTED', 'SYSTEM_MESSAGE'] }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json({ notifications });
    }
    catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserNotifications = getUserNotifications;
const getUnreadCount = async (req, res) => {
    try {
        const count = await prisma.notification.count({
            where: {
                userId: req.user.id,
                read: false
            }
        });
        res.json({ count });
    }
    catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUnreadCount = getUnreadCount;
// export const markAllAsRead = async (req: Request, res: Response) => {
//   try {
//     await prisma.notification.updateMany({
//       where: {
//       userId: (req.user as {id:string}).id,
//         read: false
//       },
//       data: {
//         read: true
//       }
//     });
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error marking notifications as read:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
// export const markSingleAsRead = async (req: Request, res: Response) => {
//   try {
//     const notification = await prisma.notification.update({
//       where: {
//         id: req.params.id,
//             userId: (req.user as {id:string}).id,
//       },
//       data: {
//         read: true
//       }
//     });
//     if (!notification) {
//       return res.status(404).json({ error: 'Notification not found' });
//     }
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
const getUserNotificationsById = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid userId' });
        }
        if (req.user.id !== userId && req.user.role !== 'admin') {
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
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserNotificationsById = getUserNotificationsById;
const getAdminNotifications = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
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
    }
    catch (error) {
        console.error('Error fetching admin notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAdminNotifications = getAdminNotifications;
const getAdminUnreadCount = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const count = await prisma.notification.count({
            where: {
                type: 'OPINION_SUBMITTED',
                read: false
            }
        });
        res.json({ count });
    }
    catch (error) {
        console.error('Error fetching admin unread count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAdminUnreadCount = getAdminUnreadCount;
// ... (keep your existing imports and other functions)
const markSingleAsRead = async (req, res) => {
    try {
        // First verify the notification exists and belongs to the user
        const notification = await prisma.notification.findUnique({
            where: { id: req.params.id }
        });
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        // Check ownership (admin can mark any as read, users only their own)
        if (notification.userId !== req.user.id &&
            req.user.role !== 'admin') {
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
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markSingleAsRead = markSingleAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';
        const whereClause = isAdmin
            ? { read: false }
            : { userId, read: false };
        await prisma.notification.updateMany({
            where: whereClause,
            data: { read: true }
        });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Error marking notifications as read:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markAllAsRead = markAllAsRead;
const createNotification = async (userId, type, message, opinionId) => {
    const notification = await prisma.notification.create({
        data: {
            type, // Now correctly typed
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
    (0, app_1.emitToUser)(userId, 'new_notification', notification);
    // If it's an admin notification, emit to admin room
    if (type === client_1.NotificationType.OPINION_SUBMITTED) {
        const unreadCount = await prisma.notification.count({
            where: {
                type: client_1.NotificationType.OPINION_SUBMITTED,
                read: false
            }
        });
        (0, app_1.emitToAdmins)('admin_notification_count', { count: unreadCount });
    }
    return notification;
};
exports.createNotification = createNotification;
