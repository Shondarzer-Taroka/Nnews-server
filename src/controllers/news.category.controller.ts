import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();


export const getNewsArea=async (req:Request,res:Response) => {
    try {
        const category= req.params.category
    } catch (error) {
        
    }
}