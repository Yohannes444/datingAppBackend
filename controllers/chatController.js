const Chat = require('../models/Chat');
const Message = require('../models/Message');

const createChat = async (req, res) => {
  const { user1Id, user2Id } = req.body;
  try {
    const chat = await Chat.create({ participants: [user1Id, user2Id] });
    res.status(201).json({ chat });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId }).populate('sender');
    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const getChatBetweenUsers = async (req, res) => {
    const { user1Id, user2Id } = req.params;
  
    try {
      // Find a chat where both users are participants
      let chat = await Chat.findOne({
        participants: { $all: [user1Id, user2Id] },
      }).populate('messages'); // Optionally populate messages
  
      // If no chat exists, you can choose to create a new one or return null
      if (!chat) {
        chat = await Chat.create({ participants: [user1Id, user2Id] });
      }
  
      res.status(200).json({ chat });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chat' });
    }
  };

  module.exports =  {
    createChat,
    getMessages,
    getChatBetweenUsers
  }

