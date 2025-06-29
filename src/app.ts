import express from 'express';
import session from 'express-session';
import passport from './config/passport';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route';

import http from 'http';
import { Server } from 'socket.io';

import votingRoutes from './routes/voting.routes';
// import ePaperRoutes from './routes/ePaper.routes';
import dotenv from 'dotenv';
import cors from 'cors';
import newsRoutes from './routes/news.route';
import { initializeVotingSocket } from './controllers/voting.controller';
dotenv.config()
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'https://dailytnnewsbd.vercel.app'], // frontend URL
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

const server = http.createServer(app);
// Set up Socket.io
const io = new Server(server, {
  cors: {
    // origin: "*", // Adjust this for production
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials:true
  },
  path:'/socket.io'
});

// Initialize voting socket
initializeVotingSocket(io);


app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/voting', votingRoutes);
// app.use('/api/e-papers', ePaperRoutes);

export default app;
