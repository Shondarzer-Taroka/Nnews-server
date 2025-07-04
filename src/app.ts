import express from 'express';
import session from 'express-session';
import passport from './config/passport';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route';
// import ePaperRoutes from './routes/ePaper.routes';
import dotenv from 'dotenv';
import cors from 'cors';
import newsRoutes from './routes/news.route';
import pollingRoutes from './routes/voting.routes';
import epaperRoutes from './routes/epaper.routes';
dotenv.config()
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:[ 'http://localhost:3000','https://dailytnnewsbd.vercel.app'], // frontend URL
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/poll', pollingRoutes);
app.use('/api/epaper',epaperRoutes)

// app.use('/api/e-papers', ePaperRoutes);

export default app;
