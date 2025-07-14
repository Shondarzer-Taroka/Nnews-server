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

import likeCommentRoutes from './routes/likeComment.routes';
import userAminRoutes from './routes/user.admin.routes';
import dashboardOverviewRoutes from './routes/dashboard.overview.route';
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

// ✅ Secure session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production', // 🔐 Set true for production
      // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 💡 Important for cross-origin
      secure: false, // 🔐 Set true for production
      sameSite: 'lax', // 💡 Important for cross-origin
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// 🔐 Passport setup
app.use(passport.initialize());
app.use(passport.session());

// 🔀 Routes
app.use('/api/users', userRoutes);
app.use('/api/users', userAminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/poll', pollingRoutes);
app.use('/api/epaper', epaperRoutes);
app.use('/api/opinion', opinionRoutes);
app.use('/api/likeComment', likeCommentRoutes);
app.use('/api/dashboard', dashboardOverviewRoutes);

export default app;
