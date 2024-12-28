import express from 'express';
import { storeEmail, getEmails, getEmailById, deleteEmailById } from '../controllers/email.controller.js';
import { protectedRt } from '../middleware/auth.middleware.js'; // You'll need to create this middleware

const router = express.Router();

router.get('/', protectedRt, getEmails);
router.get('/:id', protectedRt, getEmailById);
router.delete('/:id', protectedRt, deleteEmailById);
router.post('/', storeEmail);



export default router;