"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_admin_controller_1 = require("../controllers/user.admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
// Admin routes
router.get('/', auth_middleware_1.authenticate, isAdmin_1.isAdmin, user_admin_controller_1.getAllUsers);
router.put('/:userId/role', auth_middleware_1.authenticate, isAdmin_1.isAdmin, user_admin_controller_1.updateUserRole);
router.put('/:userId/status', auth_middleware_1.authenticate, isAdmin_1.isAdmin, user_admin_controller_1.toggleUserStatus);
router.delete('/:userId', auth_middleware_1.authenticate, isAdmin_1.isAdmin, user_admin_controller_1.deleteUser);
exports.default = router;
