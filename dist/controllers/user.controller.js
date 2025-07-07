"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInUser = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const register = async (req, res) => {
    try {
        console.log(req.body);
        const { password, ...rest } = req.body;
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                ...rest,
                password: hashed,
            },
        });
        res.status(201).json({ message: 'User registered', user });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to register', error });
    }
};
exports.register = register;
const login = (req, res) => {
    const user = req.user;
    console.log(user);
    const accessToken = (0, jwt_1.generateAccessToken)(user);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user);
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
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
        .cookie('refreshToken', refreshToken, {
        // httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        // sameSite: 'strict',
        // maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'none',
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
exports.login = login;
const logout = (req, res) => {
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
exports.logout = logout;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const logInUser = (req, res) => {
    // console.log(req.cookies);
    const token = req.cookies.refreshToken;
    if (!token) {
        res.status(401).json({ message: 'কুকি পাওয়া যায়নি' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
        res.json({ user: decoded });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ message: 'অবৈধ টোকেন' });
    }
};
exports.logInUser = logInUser;
