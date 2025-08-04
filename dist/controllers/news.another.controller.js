"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsArea = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getNewsArea = async (req, res) => {
    try {
        const { district, division, thana, union, page, limit } = req.query;
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        const where = {};
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
    }
    catch (error) {
        console.error('Error in getNewsArea:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getNewsArea = getNewsArea;
