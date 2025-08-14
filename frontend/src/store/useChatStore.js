import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      console.log("Fetched users from backend:", res.data.users);
      set({ users: res.data.users || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { socket, authUser } = useAuthStore.getState();

    if (!selectedUser) {
      toast.error("Please select a user to chat with");
      return;
    }

    try {
      const tempMessage = {
        _id: Date.now().toString(),
        text: messageData.text,
        image: messageData.image,
        senderId: authUser?._id,
        receiverId: selectedUser._id,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      set({ messages: [...messages, tempMessage] });

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempMessage._id ? res.data : msg
        ),
      }));

      socket?.emit("sendMessage", res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      set((state) => ({
        messages: state.messages.filter((msg) => !msg.isOptimistic),
      }));
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser?._id) {
      get().getMessages(selectedUser._id);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const { socket } = useAuthStore.getState();
    
    if (!socket || !selectedUser) return;

    socket.on("newMessage", (message) => {
      if (
        message.senderId === selectedUser._id ||
        message.receiverId === selectedUser._id
      ) {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.off("newMessage");
    }
  },
}));
