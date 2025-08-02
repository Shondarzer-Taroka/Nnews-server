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
        const pageNumber=Number(page)|| 1
        const limitNumber=Number(limit)|| 10
        const skip=(pageNumber-1)*limitNumber

        const where:Prisma.NewsWhereInput={}

        if (division) {
            where.OR=[
                {division:{contains:division, mode:'insensitive'}}
            ]
        }

        if (district) {
            where.OR=[
                {district:{contains:district,mode:'insensitive'}}
            ]
        }

        if (thana) {
            where.OR=[
                {thana:{contains:thana,mode:'insensitive'}}
            ]
        }

        
    } catch (error) {

    }
}