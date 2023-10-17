import express from "express";
import chatController from "../controllers/chatController.js";

const router = express.Router();

router.get("/chat/list", chatController.getListChat);
router.get("/chat/:chatId", chatController.getChatDetail);

router.post("/chat/create-room", chatController.createChat);
router.post("/chat/new-message", chatController.newMessage);

const chatRoute = router;

export default chatRoute;
