import express from 'express';
import session from 'express-session';
import passport from './config/passport';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route';

const app = express();

app.use(express.json());
app.use(cookieParser());

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

export default app;
