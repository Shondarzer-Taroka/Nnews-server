import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
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
  const user = req.user as any;
  console.log(user);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set secure HTTP-only cookies
  res
    .cookie('accessToken', accessToken, {
      // httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      // maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production
      path: '/',
      // domain: process.env.NODE_ENV === 'production' ? '.dailytnnewsbd.vercel.app' : undefined,
      sameSite:'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days

    })
    .cookie('refreshToken', refreshToken, {
      // httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      // maxAge: 7 * 24 * 60 * 60 * 1000,
       sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production
      path: '/',
  //  domain: process.env.NODE_ENV === 'production' 
  //   ? '.dailytnnewsbd.vercel.app' // Your Vercel domain
  //   : 'localhost', // For development

      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days

    })
    .status(200)
    .json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
};





export const logout = (req: Request, res: Response) => {
  res
    .clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      // sameSite: 'strict',
    })
    .clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      // sameSite: 'strict',
    })
    .status(200)
    .json({ message: 'Logged out successfully' });
};





const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const logInUser = (req: Request, res: Response) => {
  // console.log(req.cookies);
  const token = req.cookies.refreshToken;



  if (!token) {
    res.status(401).json({ message: 'কুকি পাওয়া যায়নি' });
    return
  }

  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    res.json({ user: decoded });
    return
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'অবৈধ টোকেন' });
  }
}