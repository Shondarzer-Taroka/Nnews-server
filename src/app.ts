// // app.ts
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import session from 'express-session';
import passport from './config/passport';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route';
import dotenv from 'dotenv';
import cors from 'cors';
import newsRoutes from './routes/news.route';
import pollingRoutes from './routes/voting.routes';
import epaperRoutes from './routes/epaper.routes';
import opinionRoutes from './routes/opinion.routes';
import notificationRoutes from './routes/notification.routes';
import likeCommentRoutes from './routes/likeComment.routes';
import userAminRoutes from './routes/user.admin.routes';
import dashboardOverviewRoutes from './routes/dashboard.overview.route';
import { verifyTokenSocket } from './utils/jwtVerify';
dotenv.config();
const app = express();

// 🔑 Middleware setup
app.use(express.json());
app.use(cookieParser());

// ✅ Correct CORS for cross-origin cookies
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://dailytnnewsbd.vercel.app'],
    credentials: true,
  })
);

// // sockt
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials:true,
  }
});




// Socket.IO middleware for authentication


io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log('ksdjf',socket);
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  const user = verifyTokenSocket(token);
  if (!user) {
    return next(new Error('Authentication error: Invalid token'));
  }

  socket.data.user = user;
  next();
});


// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.data.user.id}`);

  // Join user-specific room
  socket.join(`user_${socket.data.user.id}`);

  // Join admin room if user is admin
  if (socket.data.user.role === 'admin') {
    socket.join('admin_room');
    console.log(`Admin joined: ${socket.data.user.id}`);
  }

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.data.user.id}`);
  });
});



// Helper functions for emitting events
export const emitToUser = (userId: string, event: string, data: any) => {
  io.to(`user_${userId}`).emit(event, data);
};

export const emitToAdmins = (event: string, data: any) => {
  io.to('admin_room').emit(event, data);
};

export { io };



httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

//  Secure session configuration
app.use(
  session({
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
  })
);

//  Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/users', userAminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/poll', pollingRoutes);
app.use('/api/epaper', epaperRoutes);
// app.use('/api/opinion', opinionRoutes);
// Routes
// app.use('/api/auth', authRoutes);
app.use('/api/opinion', opinionRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api/likeComment', likeCommentRoutes);
app.use('/api/dashboard', dashboardOverviewRoutes);

export default app;
