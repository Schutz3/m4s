import { User } from '../models/data.model.js';
import bcrypt from 'bcrypt';

export const updateUserPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
        }
        await user.save();

        res.status(200).json({ 
            message: 'User preferences updated successfully',
        });
    } catch (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};