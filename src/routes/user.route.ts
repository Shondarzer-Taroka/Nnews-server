import express from 'express';
import passport from 'passport';
import { register, login, logInUser, logout } from '../controllers/user.controller';
import { getSingleUserInfo, updateUser } from '../controllers/profile.user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', passport.authenticate('local', { session: false }), login);
router.post('/logout', logout);
router.get('/logInUser', logInUser)
router.get('/singleUserInfo/:id', authenticate, getSingleUserInfo)
router.get('/updateUser/:id', authenticate, updateUser)
export default router;

// router.get('/logInUser',logInUser)
