import express from 'express';
import { login, signup, logout, checkAuth, generateCaptcha} from '../controllers/auth.controller.js';
import { protectedRt } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/status', (req, res) => {
    res.status(200).json({ status: 'API is running' });
});

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);
router.get('/check', protectedRt, checkAuth);
router.get('/captcha', generateCaptcha);


export default router;