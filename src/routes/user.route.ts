import express from 'express';
import passport from 'passport';
import { register, login, logInUser, logout } from '../controllers/user.controller';
import { getSingleUserInfo } from '../controllers/profile.user.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', passport.authenticate('local', { session: false }), login);
router.post('/logout', logout);
router.get('/logInUser',logInUser)
router.get('/singleUserInfo/:id',getSingleUserInfo)
export default router;

// router.get('/logInUser',logInUser)
