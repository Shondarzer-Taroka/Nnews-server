"use strict";
// // // backend/src/routes/notification.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
// Admin notifications
router.get('/admin', auth_middleware_1.authenticate, notification_controller_1.getAdminNotifications);
// User notifications
router.get('/user', auth_middleware_1.authenticate, notification_controller_1.getUserNotifications);
// Unread count
router.get('/unread-count', auth_middleware_1.authenticate, notification_controller_1.getUnreadCount);
// Mark all as read
router.post('/mark-as-read', auth_middleware_1.authenticate, notification_controller_1.markAllAsRead);
// Mark single as read
router.post('/:id/read', auth_middleware_1.authenticate, notification_controller_1.markSingleAsRead);
// Get notifications by user ID
router.get('/', auth_middleware_1.authenticate, notification_controller_1.getUserNotificationsById);
router.get('/admin', auth_middleware_1.authenticate, notification_controller_1.getAdminNotifications);
router.get('/admin/unread-count', auth_middleware_1.authenticate, notification_controller_1.getAdminUnreadCount);
exports.default = router;
