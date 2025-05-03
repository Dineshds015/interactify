import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagingLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagingLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagingLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages, users } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            const updatedUsers = [
                users.find((u) => u._id === selectedUser._id),
                ...users.filter((u) => u._id !== selectedUser._id)
            ];
            set({
                messages: [...messages, res.data],
                users: updatedUsers
            });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            const { selectedUser, messages, users } = get();
            const isFromSelectedUser = selectedUser?._id === newMessage.senderId;

            if (isFromSelectedUser) {
                set({ messages: [...messages, newMessage] });
            }

            const updatedUsers = [
                users.find((u) => u._id === newMessage.senderId),
                ...users.filter((u) => u._id !== newMessage.senderId)
            ];

            set({ users: updatedUsers });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
