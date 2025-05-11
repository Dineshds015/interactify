import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    unreadMessages: {},
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
            const { selectedUser, messages, users, unreadMessages } = get();
            const isFromSelectedUser = selectedUser?._id === newMessage.senderId;

            const sound = new Audio("/message.mp3");

            if (isFromSelectedUser) {
                set({ messages: [...messages, newMessage] });
            } else {
                const count = unreadMessages[newMessage.senderId] || 0;
                set({
                    unreadMessages: {
                        ...unreadMessages,
                        [newMessage.senderId]: count + 1,

                    }
                });

                sound.play();
            }

            const updatedUsers = [
                users.find((u) => u._id === newMessage.senderId),
                ...users.filter((u) => u._id !== newMessage.senderId)
            ];

            set({ users: updatedUsers });
        });
    },
    setSelectedUser: (user) => {
        const { unreadMessages } = get();
        const updatedUnread = { ...unreadMessages };

        if (user?._id) {
            delete updatedUnread[user._id]; // Clear only this user
        } else {
            // Clear all if user is null
            for (const key in updatedUnread) {
                delete updatedUnread[key];
            }
        }

        set({ selectedUser: user, unreadMessages: updatedUnread });
    },


    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

}));
