import { Server } from "socket.io";
import http from "http";
import express from "express";
import Group from "../models/group.model.js"; // Import the Group model to find user's groups

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true,
    },
});

// Used to store online users
const userSocketMap = {}; // { userId: socketId }

// Function to get socket ID of a receiver
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

io.on("connection", async (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;

    // Store socketId for userId
    if (userId) {
        userSocketMap[userId] = socket.id;

        // Get the groups the user is part of and join the corresponding rooms
        try {
            const groups = await Group.find({ members: userId }).select("_id");
            groups.forEach((group) => {
                // Join each group room by groupId
                socket.join(group._id.toString());
            });
            console.log(`User ${userId} joined groups: ${groups.map(g => g._id)}`);
        } catch (error) {
            console.error("Error getting groups for user:", error.message);
        }
    }

    // Notify all clients about online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // When a user disconnects
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        // Remove user from userSocketMap
        delete userSocketMap[userId];

        // Notify all clients about online users
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // User should also leave all group rooms
        Group.find({ members: userId }).then(groups => {
            groups.forEach(group => {
                socket.leave(group._id.toString());
            });
        });
    });

    // Optionally, listen for any other events like sending messages
    socket.on("sendMessageToGroup", (groupId, message) => {
        // Emit the message to all members of the group
        io.to(groupId).emit("newGroupMessage", message);
    });
});

export { io, app, server };
