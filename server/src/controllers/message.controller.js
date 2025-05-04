import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";

// Get users except the logged-in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const searchUsers = async (req, res) => {
    try {
        const search = req.query.search || "";

        const users = await User.find({
            fullName: { $regex: search, $options: "i" },
        }).select("-password");

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in searchUsers: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Get messages between two users
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Send individual message
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, members, groupPic } = req.body;
        const admin = req.user._id;

        const group = new Group({
            name,
            members: [...members, admin],
            admin,
            groupPic
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error("Error in createGroup:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get groups of logged-in user
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId });
        res.status(200).json(groups);
    } catch (error) {
        console.error("Error in getUserGroups:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all messages of a group
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ groupId });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getGroupMessages:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Send message in a group
export const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { text, image } = req.body;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newGroupMessage = new Message({
            senderId,
            groupId,
            text,
            image: imageUrl,
        });

        await newGroupMessage.save();

        io.to(groupId).emit("newGroupMessage", newGroupMessage);

        res.status(201).json(newGroupMessage);
    } catch (error) {
        console.error("Error in sendGroupMessage:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
