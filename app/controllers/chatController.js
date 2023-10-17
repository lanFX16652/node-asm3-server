import { ChatModel } from "../models/chatModel.js";
class ChatController {
  #chatModel;

  constructor(chatModel) {
    this.#chatModel = chatModel;
  }

  createChat = async (req, res, next) => {
    try {
      const newChat = new ChatModel({
        messages: [
          {
            author: req?.user?._id,
            authorType: req.body.authorType,
            content: req.body.content,
            createdAt: new Date(),
          },
        ],
      });

      await newChat.save();

      global.socket.emit("chat-created", newChat);

      return res.status(201).json(newChat);
    } catch (error) {
      next(error);
    }
  };

  newMessage = async (req, res, next) => {
    const { content, authorType, chatId } = req.body;

    const message = {
      content,
      authorType,
      author: req?.user?._id,
      createdAt: new Date(),
    };

    try {
      await this.#chatModel.findByIdAndUpdate(chatId, {
        $push: {
          messages: message,
        },
      });

      global.socket.emit('new-message', message);

      return res.json(message);
    } catch (error) {
      next(error);
    }
  };

  getChatDetail = async (req, res, next) => {
    const { chatId } = req.params;

    try {
      const chatFound = await this.#chatModel.findById(chatId);

      return res.json(chatFound);
    } catch (error) {
      next(error);
    }
  };

  getListChat = async (req, res, next) => {
    try {
      const chats = await this.#chatModel.find();
      return res.json(chats);
    } catch (error) {
      next(error);
    }
  };
}

export default new ChatController(ChatModel);
