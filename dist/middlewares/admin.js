"use strict";
// import { Request, Response, NextFunction } from 'express';
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    const user = req.user; // 👈 Type assertion to fix the error
    if (req.isAuthenticated() && user?.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: '⛔ Unauthorized. Admin only.' });
};
exports.isAdmin = isAdmin;
