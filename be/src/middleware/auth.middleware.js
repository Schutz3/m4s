import jwt from 'jsonwebtoken';
import { User } from '../models/data.model.js';

export const protectedRt = async (req, res, next) => {
    const token = req.cookies.science;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId) {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in middleware"+error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};