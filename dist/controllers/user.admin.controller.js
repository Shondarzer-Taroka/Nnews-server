"use strict";
// // backend/src/controller/user.admin.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.toggleUserStatus = exports.updateUserRole = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!['user', 'editor', 'moderator', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateUserRole = updateUserRole;
// Toggle user status
const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true
            }
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.toggleUserStatus = toggleUserStatus;
// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await prisma.user.delete({
            where: { id: userId }
        });
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteUser = deleteUser;
// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
// // Get all users (admin only)
// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     // Verify admin role again for extra security
//     if ((req.user as {role:string})?.role !== 'admin') {
//       return res.status(403).json({ message: 'Admin access required' });
//     }
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         isActive: true,
//         createdAt: true
//       },
//       orderBy: {
//         createdAt: 'desc'
//       }
//     });
//     res.status(200).json(users);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
// // ... (keep other controller methods the same)
