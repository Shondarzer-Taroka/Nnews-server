"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        console.log(token, 'auth.middleware');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        // console.log(decoded);
        const decoded = jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
        console.log(decoded);
        req.user = decoded;
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { PrismaClient } from '@prisma/client';
//  const prisma = new PrismaClient();
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//       };
//     }
//   }
// }
// export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
//     const user = await prisma.user.findUnique({ 
//       where: { id: decoded.userId },
//       select: { id: true }
//     });
//     if (!user) {
//       return res.status(401).json({ error: 'User not found' });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ error: 'Invalid or expired token' });
//   }
// };
