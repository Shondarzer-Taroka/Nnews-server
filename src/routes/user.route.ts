// /// src/routes/user.routes.ts
import express from 'express';
import passport from 'passport';
import { register, login } from '../controllers/user.controller';

const router = express.Router();

router.post('/register', register);

router.post('/login', passport.authenticate('local'), login);

export default router;
