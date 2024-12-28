import jwt from 'jsonwebtoken';

export const generateToken = (userId, role, res) => {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('science', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'prod', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return token;
}