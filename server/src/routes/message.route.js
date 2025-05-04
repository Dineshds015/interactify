import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getMessages,
    getUsersForSidebar,
    sendMessage,
    createGroup,
    getUserGroups,
    getGroupMessages,
    sendGroupMessage,
    searchUsers,
} from "../controllers/message.controller.js";

const router = express.Router();

// Individual messaging routes
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/search-users", protectRoute, searchUsers); // <- move this above /:id
router.post("/send/:id", protectRoute, sendMessage);

// Group chat routes
router.post("/groups", protectRoute, createGroup);
router.get("/groups", protectRoute, getUserGroups);
router.get("/groups/:groupId/messages", protectRoute, getGroupMessages);
router.post("/groups/:groupId/messages", protectRoute, sendGroupMessage);

// Place this at the bottom
router.get("/:id", protectRoute, getMessages);

export default router;