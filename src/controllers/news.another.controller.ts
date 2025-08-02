import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

interface QueryParams {
    division?: string;
    district?: string;
    thana?: string;
    union?: string;
    page?: number;
    limit?: number;
}

export const getNewsArea = async (req: Request, res: Response) => {
    try {
        const {
            district,
            division,
            thana,
            union,
            page,
            limit
        } = req.query as unknown as QueryParams
        const pageNumber = Number(page) || 1
        const limitNumber = Number(limit) || 10
        const skip = (pageNumber - 1) * limitNumber

        const where: Prisma.NewsWhereInput = {}

        if (division) {
            where.OR = [
                { division: { contains: division, mode: 'insensitive' } }
            ]
        }

        if (district) {
            where.OR = [
                { district: { contains: district, mode: 'insensitive' } }
            ]
        }

        if (thana) {
            where.OR = [
                { thana: { contains: thana, mode: 'insensitive' } }
            ]
        }

        if (union) {
            where.OR = [
                { union: { contains: union, mode: 'insensitive' } }
            ]
        }

        const total = await prisma.news.count({ where })

        const news = await prisma.news.findMany({
            where,
            include: {
                author: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            skip,
            take: limitNumber

        })

        res.json({
            news,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber)
        });
    } catch (error) {
        console.error('Error in getQueryNews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}