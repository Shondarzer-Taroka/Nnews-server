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
        } = req.query as unknown as QueryParams;
        
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        const where: Prisma.NewsWhereInput = {};

        if (division) {
            where.division = { contains: division, mode: 'insensitive' };
        }

        if (district) {
            where.district = { contains: district, mode: 'insensitive' };
        }

        if (thana) {
            where.thana = { contains: thana, mode: 'insensitive' };
        }

        if (union) {
            where.union = { contains: union, mode: 'insensitive' };
        }

        const [total, news] = await Promise.all([
            prisma.news.count({ where }),
            prisma.news.findMany({
                where,
                include: {
                    author: {
                        select: {
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limitNumber
            })
        ]);

        res.json({
            success: true,
            data: {
                news,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(total / limitNumber),
                    hasNextPage: pageNumber < Math.ceil(total / limitNumber),
                    hasPrevPage: pageNumber > 1
                }
            }
        });
    } catch (error) {
        console.error('Error in getNewsArea:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
};