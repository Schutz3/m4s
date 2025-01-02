import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    preference: {
        theme: {
            type: String,
            enum: [
                "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", 
                "synthwave", "retro", "cyberpunk", "valentine", "halloween", 
                "garden", "forest", "aqua", "lofi", "pastel", "fantasy", 
                "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", 
                "business", "acid", "lemonade", "night", "coffee", "winter"
            ],
            default: "dark",
        },
    },
}, { timestamps: true });

const EmailSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    html: {
        type: String,
    },
    text: {
        type: String,
    },
    attachments: [{
        filename: {
            type: String,
            required: true,
        },
        disposition: {
            type: String,
            default: "attachment",
        },
        objectName: {
            type: String,
            required: false,
        },
        mimeType: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        content: {
            type: String,
            required: false,
        },
        url: {
            type: String,
            required: false,
        },
    }],
    receivedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Email = mongoose.model('Emails', EmailSchema);
const User = mongoose.model('User', UserSchema);

export { Email, User };
