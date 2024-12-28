import { Email } from '../models/data.model.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { emitNewEmail } from '../lib/socket.js';

dotenv.config();

const RECEIVE_TOKEN = process.env.RECEIVE_TOKEN;

export const getEmails = async (req, res) => {
    try {
        const user = req.user;
        let query = {};

        if (user.role === 'user') {
            query = { to: new RegExp(`^${user.username}@`) };
        }

        const emails = await Email.find(query, '_id from to subject receivedAt')
            .sort({ receivedAt: -1 });
        res.status(200).json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const storeEmail = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header is missing" });
    }

    const token = authHeader.split(" ")[1];
    if (token !== RECEIVE_TOKEN) {
        return res.status(403).json({ message: "Invalid token" });
    }

    const data = req.body;
    if (!data) {
        return res.status(400).json({ message: "No data provided" });
    }

    const requiredFields = ['from', 'to', 'subject'];
    for (const field of requiredFields) {
        if (!(field in data)) {
            return res.status(400).json({ message: `Missing required field: ${field}` });
        }
    }

    const emailData = {
        from: data.from,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        attachments: data.attachments,
        receivedAt: new Date()
    };

    try {
        const newEmail = new Email(emailData);
        const result = await newEmail.save();

        await emitNewEmail({
            _id: result._id,
            from: result.from,
            to: result.to,
            subject: result.subject,
            receivedAt: result.receivedAt
        });
        return res.status(201).json({ message: "Email stored successfully", id: result._id });
    } catch (error) {
        console.error('Error storing email:', error);
        return res.status(500).json({ message: error.message });
    }
};

export const getEmailById = async (req, res) => {
    try {
        const user = req.user;
        const emailId = req.params.id;

        if (!emailId) {
            return res.status(400).json({ message: 'Email ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(emailId)) {
            return res.status(400).json({ message: 'Invalid Email ID format' });
        }

        const email = await Email.findById(emailId);

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        if (user.role !== 'admin') {
            const userEmailPrefix = `${user.username}@`;
            if (!email.to.startsWith(userEmailPrefix)) {
                return res.status(403).json({ message: 'You do not have permission to view this email' });
            }
        }

        res.status(200).json(email);
    } catch (error) {
        console.error('Error fetching email by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteEmailById = async (req, res) => {
    try {
        const user = req.user;
        const emailId = req.params.id;

        if (!emailId) {
            return res.status(400).json({ message: 'Email ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(emailId)) {
            return res.status(400).json({ message: 'Invalid Email ID format' });
        }

        const email = await Email.findById(emailId);

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        if (user.role !== 'admin') {
            const userEmailPrefix = `${user.username}@`;
            if (!email.to.startsWith(userEmailPrefix)) {
                return res.status(403).json({ message: 'You do not have permission to delete this email' });
            }
        }

        await Email.findByIdAndDelete(emailId);

        res.status(200).json({ message: 'Email deleted successfully' });
    } catch (error) {
        console.error('Error deleting email by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};