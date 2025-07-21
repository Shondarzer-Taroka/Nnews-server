"use strict";
// import express from 'express';
// import session from 'express-session';
// import passport from './config/passport';
// import cookieParser from 'cookie-parser';
// import userRoutes from './routes/user.route';
// // import ePaperRoutes from './routes/ePaper.routes';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import newsRoutes from './routes/news.route';
// import pollingRoutes from './routes/voting.routes';
// import epaperRoutes from './routes/epaper.routes';
// import opinionRoutes from './routes/opinion.routes';
// import likeCommentRoutes from './routes/likeComment.routes';
// dotenv.config()
// const app = express();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({
//   origin:[ 'http://localhost:3000','https://dailytnnewsbd.vercel.app'], // frontend URL
//   credentials: true
// }));
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'keyboard cat',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     maxAge: 1000 * 60 * 60 * 24,
//   },
// }));
// app.use(passport.initialize());
// app.use(passport.session());
// app.use('/api/users', userRoutes);
// app.use('/api/news', newsRoutes);
// app.use('/api/poll', pollingRoutes);
// app.use('/api/epaper',epaperRoutes)
// app.use('/api/opinion',opinionRoutes)
// app.use('/api/likeComment',likeCommentRoutes)
// // app.use('/api/e-papers', ePaperRoutes);
// export default app;
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const news_route_1 = __importDefault(require("./routes/news.route"));
const voting_routes_1 = __importDefault(require("./routes/voting.routes"));
const epaper_routes_1 = __importDefault(require("./routes/epaper.routes"));
const opinion_routes_1 = __importDefault(require("./routes/opinion.routes"));
const likeComment_routes_1 = __importDefault(require("./routes/likeComment.routes"));
const user_admin_routes_1 = __importDefault(require("./routes/user.admin.routes"));
const dashboard_overview_route_1 = __importDefault(require("./routes/dashboard.overview.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// 🔑 Middleware setup
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// ✅ Correct CORS for cross-origin cookies
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://dailytnnewsbd.vercel.app'],
    credentials: true,
}));
//  Secure session configuration
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production', // Set true for production
        // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', //  Important for cross-origin
        secure: true, //  Set true for production
        sameSite: 'none', //  Important for cross-origin
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
//  Passport setup
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Routes
app.use('/api/users', user_route_1.default);
app.use('/api/users', user_admin_routes_1.default);
app.use('/api/news', news_route_1.default);
app.use('/api/poll', voting_routes_1.default);
app.use('/api/epaper', epaper_routes_1.default);
app.use('/api/opinion', opinion_routes_1.default);
app.use('/api/likeComment', likeComment_routes_1.default);
app.use('/api/dashboard', dashboard_overview_route_1.default);
exports.default = app;
