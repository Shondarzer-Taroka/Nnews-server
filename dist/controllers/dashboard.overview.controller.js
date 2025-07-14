"use strict";
// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoricalData = exports.getDashboardOverView = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
const getCounts = async (model) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    // 👇 Safely cast to `any` to avoid union signature confusion
    const delegate = modelMap[model];
    return {
        day: await delegate.count({ where: { createdAt: { gte: oneDayAgo } } }),
        week: await delegate.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        month: await delegate.count({ where: { createdAt: { gte: oneMonthAgo } } }),
        year: await delegate.count({ where: { createdAt: { gte: oneYearAgo } } }),
    };
};
const getDashboardOverView = async (req, res) => {
    try {
        const dashboardData = {
            users: await getCounts('user'),
            news: await getCounts('news'),
            polls: await getCounts('poll'),
            epapers: await getCounts('ePaper'), // ✅ CORRECT KEY
            opinions: await getCounts('opinion'),
            comments: await getCounts('comment'),
            likes: await getCounts('like'),
        };
        res.json(dashboardData);
    }
    catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDashboardOverView = getDashboardOverView;
const getHistoricalData = async (req, res) => {
    try {
        const months = 6;
        const historicalData = [];
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
    }
    catch (error) {
        console.error('Error fetching historical data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getHistoricalData = getHistoricalData;
