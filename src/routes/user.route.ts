import express from 'express';
import passport from 'passport';
import { register, login, logInUser } from '../controllers/user.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', passport.authenticate('local', { session: false }), login);
router.get('/logInUser',logInUser)

export default router;
