// controllers/chatController.js
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
    let chat = await Chat.findOne({
      participants: { $all: [user1Id, user2Id] },
    }).populate('messages');

    if (!chat) {
      chat = await Chat.create({ participants: [user1Id, user2Id] });
    }

    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
};

// controllers/chatController.js (in the sendMessage function)
const sendMessage = async (req, res) => {
  const { chatId, senderId, content } = req.body;

  try {
    if (!chatId || !senderId || !content) {
      return res.status(400).json({ error: 'Missing required fields: chatId, senderId, and content are required' });
    }

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content,
      read: false,
    });

    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: message._id },
      lastMessage: message._id,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username');

    const io = req.app.get('socketIo');
    const userSocketMap = req.app.get('userSocketMap');

    // Debug: Log the userSocketMap
    console.log('Current userSocketMap:', Array.from(userSocketMap.entries()));

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const recipientId = chat.participants.find(
      (participant) => participant.toString() !== senderId
    );

    io.to(chatId).emit('newMessage', populatedMessage);

    if (recipientId) {
      const recipientSocketId = userSocketMap.get(recipientId.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', populatedMessage);
        console.log(`Message emitted to recipient ${recipientId} with socket ID ${recipientSocketId}`);
      } else {
        console.log(`Recipient ${recipientId} is not online`);
      }
    }

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
};

const getChats = async (req, res) => {
  try {
    const { userId } = req.params;
   
    const chats = await Chat.find({
      participants: userId
    }).populate('participants', 'username profilePicture');
    console.log("Chats:", chats);

    if (!chats) {
      return res.status(404).json({ error: "Chats not found" });
    }else{
      return res.status(200).json(chats);
    }
  }catch (error) {
    console.error("Error in getChats:", error);
    }
  }

module.exports = { 
  createChat,
  getMessages,
  getChatBetweenUsers,
  sendMessage,
  getChats
};