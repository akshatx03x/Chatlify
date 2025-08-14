import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

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
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Account created successfully");
        get().connectSocket();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Logged in successfully");
        get().connectSocket();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || error.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

 connectSocket: () => {
  const { authUser, socket } = get();
  if (!authUser) return;

  if (socket?.connected) return;

  const newSocket = io(BASE_URL, {
    query: { userId: authUser._id },
    transports: ["websocket"], 
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  newSocket.on("connect", () => {
    console.log("Socket connected:", newSocket.id);
  });

  newSocket.on("disconnect", (reason) => {
    console.warn("Socket disconnected:", reason);
  });

  newSocket.on("getOnlineUsers", (userIds) => {
    console.log("Online Users:", userIds);
    set({ onlineUsers: userIds });
  });

  set({ socket: newSocket });
},

  disconnectSocket: () => {
  const { socket } = get();
  if (socket?.connected) {
    socket.removeAllListeners();
    socket.disconnect();
    console.log("Socket disconnected manually");
  }
},
}));