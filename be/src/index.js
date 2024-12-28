import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import emailRoutes from './routes/email.route.js';
import userRoutes from './routes/user.route.js';
import dotenv from 'dotenv';
import { app, server } from "./lib/socket.js";
import path from 'path';
import { connectDB } from './lib/db.js';

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();
const FE_URL = process.env.FE_URL;


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173','http://10.0.0.3', FE_URL],
  credentials: true,
}));


app.use("/api/auth", authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/user', userRoutes);

if (process.env.NODE_ENV === 'prod') {
    app.use(express.static(path.join(__dirname, '../fe/dist')));
    
    app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../fe', 'dist', 'index.html'));
   });
}

server.listen(PORT, () => { 
    console.log('Server is running on port: ' + PORT);
    connectDB(); // Connect to MongoDB database
});