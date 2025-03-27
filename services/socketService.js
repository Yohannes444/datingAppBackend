// services/socketService.js
const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const socketService = (io) => {
  // Store userId-to-socket mapping
  const userSocketMap = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Automatically map userId from query parameter
    const userId = socket.handshake.query.userId;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
      socket.emit('connected', { userId, message: 'Successfully connected' });
    } else {
      console.error('Invalid or missing userId in query parameter:', userId);
      socket.emit('error', { message: 'Invalid or missing userId in query parameter' });
    }

    // Join a chat room
    socket.on('joinChat', (data) => {
      const chatId = typeof data === 'string' ? data : (data && data.chatId ? data.chatId : null);
      if (!chatId) {
        socket.emit('error', { message: 'Invalid chat ID' });
        return console.error('Invalid chatId received:', data);
      }

      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
      socket.emit('joined', { chatId });
    });

    // Handle sending messages (for testing via Socket.IO directly)
    socket.on('sendMessage', async (data) => {
      try {
        let messageData = data;
        if (typeof data === 'string') {
          try {
            messageData = JSON.parse(data);
          } catch (e) {
            throw new Error('Invalid JSON data received');
          }
        }

        const { chatId, senderId, content } = messageData || {};
        if (!chatId || !senderId || !content) {
          throw new Error('Missing required fields: chatId, senderId, and content are required');
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

        io.to(chatId).emit('newMessage', populatedMessage);
        console.log('Message sent successfully:', populatedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message', details: error.message });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      for (let [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });

    // Optional: Keep the connectUser event for manual connections
    socket.on('connectUser', (data) => {

      const userId = JSON.parse(data).userId;
      if (!userId ) {
        socket.emit('error', { message: 'Invalid user ID' });
        return console.error('Invalid userId received:', data);
      }

      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
      socket.emit('connected', { userId, message: 'Successfully connected' });
    });
  });

  return { io, userSocketMap };
};

module.exports = socketService;