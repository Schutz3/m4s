import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { User } from '../models/data.model.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const FE_URL = process.env.FE_URL;

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://10.0.0.3', 'http://10.0.0.2', FE_URL],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  const userId = socket.handshake.query.userId;
  if (!userId) {
    return next(new Error('Authentication error: No user ID provided'));
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new Error('User not found'));
    }

    if (!user.isActive) {
      return next(new Error('User account is inactive'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {

  socket.join(socket.user.username);

  io.emit('getOnlineUsers', getOnlineUsers());

  socket.on('disconnect', () => {
    io.emit('getOnlineUsers', getOnlineUsers());
  });
});

const emitNewEmail = async (email) => {
  if (email && email.to) {
    const username = email.to.split('@')[0];
    
    io.to(username).emit('newEmail', email);

    try {
      const adminUsers = await User.find({ role: 'admin', isActive: true });
      
      adminUsers.forEach(admin => {
        io.to(admin.username).emit('newEmail', {
          ...email,
          isAdminNotification: true
        });
      });
    } catch (error) {
      console.error('Error emitting to admin users:', error);
    }
  }
};

const getOnlineUsers = () => {
  return Array.from(io.sockets.sockets.values()).map(socket => socket.user._id);
};

export { app, server, io, emitNewEmail };