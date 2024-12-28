import { generateToken } from '../lib/utils.js';
import { User } from '../models/data.model.js';
import bcrypt from 'bcrypt';
import svgCaptcha from 'svg-captcha';

const captchaStore = new Map();

export const generateCaptcha = (req, res) => {
    const options = {
        size: 6, // Length of the CAPTCHA string
        noise: 2, // Amount of noise on the CAPTCHA (optional)
        color: true, // Whether to use colors in the CAPTCHA (optional)
        background: '#cc9966', // Background color of the CAPTCHA (optional)
        characters: 'TIKAYUPRMESTtikayuprmest0987654321FHNDWOKVfhndwokv', // Custom characters
      };
    const captcha = svgCaptcha.create(options);
    const captchaId = Date.now().toString();
    captchaStore.set(captchaId, captcha.text);

    // Set expiration for the CAPTCHA (e.g., 5 minutes)
    setTimeout(() => {
        captchaStore.delete(captchaId);
    }, 5 * 60 * 1000);

    res.type('svg');
    res.status(200).send({
        captchaId: captchaId,
        captchaSvg: captcha.data
    });
};

export const signup = async (req, res) => {
    const { username, password, captchaId, captchaValue } = req.body;
    const bannedUsernames = ['admin', 'user', 'guest', 'bot', 'test', 'password', '123456', 'qwerty', 'asdf', '1234567890', 'jawa'];

    try {
        if (!username || !password || !captchaId || !captchaValue) {
            return res.status(400).json({ message: 'Username, password, and CAPTCHA are required' });
        } else if (password.length < 3) {
            return res.status(400).json({ message: 'Password must be at least 3 characters long' });
        } else if (!captchaStore.has(captchaId)) {
            return res.status(400).json({ message: 'Invalid CAPTCHA' });
        } else if (captchaStore.get(captchaId).toLowerCase()!== captchaValue.toLowerCase()) {
            return res.status(400).json({ message: 'Invalid CAPTCHA' });
        } else if (bannedUsernames.includes(username.toLowerCase())) { 
            return res.status(403).json({ message: 'Banned Username' });
        } else if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
        }

        // Verify CAPTCHA
        const storedCaptchaValue = captchaStore.get(captchaId);
        if (!storedCaptchaValue || storedCaptchaValue.toLowerCase() !== captchaValue.toLowerCase()) {
            return res.status(400).json({ message: 'Invalid CAPTCHA' });
        }

        // Delete used CAPTCHA
        captchaStore.delete(captchaId);

        const user = await User.findOne({ username });

        if (user) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, password: hashedPassword });

        if (!newUser) {
            return res.status(400).json({ message: 'Failed to create user' });
        }

        await newUser.save();
        generateToken(newUser._id, newUser.role, res);

        res.status(201).json({ 
            message: 'User created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is inactive. Please contact an administrator.' });
        }

        generateToken(user._id, user.role, res);

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = (req, res) => {
    try {
        res.clearCookie('science');
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkAuth = async (req, res) => {
    try{
        res.status(200).json(req.user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error in Check Auth Controller' });
    } 
}