import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        ...rest,
        password: hashed,
      },
    });
    res.status(201).json({ message: 'User registered', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register', error });
  }
};

export const login = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Login successful', user: req.user });
};
