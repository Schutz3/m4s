import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useEmailStore } from './useEmailStore';
import { useCaptchaStore } from "./useCaptchaStore.js";
import { playNotificationSound, showNotification, updateFaviconBadge } from '../lib/utils';


const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      const userData = res.data;
      
      await new Promise(resolve => {
        set((state) => {
          const newState = { 
            ...state, 
            authUser: {
              user: {
                id: userData._id,
                username: userData.username,
                role: userData.role,
                isActive: userData.isActive,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt
              },
              preference: userData.preference
            }
          };
          resolve();
          return newState;
        });
      });

      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },


  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      await new Promise(resolve => {
        set((state) => {
          const newState = { ...state, authUser: res.data };
          resolve();
          return newState;
        });
      });
      get().connectSocket();
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      await new Promise(resolve => {
        set((state) => {
          const newState = { ...state, authUser: res.data };
          resolve();
          return newState;
        });
      });
      get().connectSocket();
      toast.success("Signed up successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      useCaptchaStore.getState().fetchCaptcha();
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },
  

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    try {
      await axiosInstance.put("/user/settings", {
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    }
  },

  updateThemePreference: async (theme) => {
    try {
      await axiosInstance.put("/user/settings", {
        preference: { theme },
      });
      set((state) => ({
        authUser: {
          ...state.authUser,
          preference: { ...state.authUser.preference, theme },
        },
      }));
      localStorage.setItem("m4s-theme", theme);
      toast.success("Theme preference updated");
    } catch (error) {
      toast.error("Failed to update theme preference");
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null });
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || !authUser.user || !authUser.user.id) {
      console.error('Cannot connect socket.io without authentication', authUser);
      return;
    }
    if (get().socket?.connected) {
      return;
    }
  
    const socket = io(BASE_URL, {
      query: {
        userId: authUser.user.id,
      },
    });
  
    socket.connect();
  
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      set({ socket: socket });
    });
  
    socket.on('connect_error', (error) => {
      toast.error('Failed to connect to server');
    });
  
    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });
  
    socket.on('newEmail', async (email) => {
      toast.success(`New email from ${email.from}`);
      useEmailStore.getState().addNewEmail(email);
    
      playNotificationSound();
    
      showNotification('New Email', {
        body: `From: ${email.from}`,
        icon: 'https://s3.scz.my.id/m4s/assets/m4s-ico.png'
      });
      updateFaviconBadge();
      document.title = '(New) Mail4Spam - By Zee';
    });
  
    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });
  
    set({ socket: socket });
  },
}));
