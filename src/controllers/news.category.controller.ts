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

export const getNewsArea=async (req:Request,res:Response) => {
    try {
        const category= req.params.category
    } catch (error) {
        
    }
}