import express from 'express';
import { updateUserPreferences } from '../controllers/user.controller.js';
import { protectedRt } from '../middleware/auth.middleware.js';

const router = express.Router();

router.put('/settings', protectedRt, updateUserPreferences);

export default router;