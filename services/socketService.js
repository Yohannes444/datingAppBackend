// services/socketService.js
const mongoose = require('mongoose');
const Chat = require('../models/Chat'); // Adjust path to your Chat model
const Message = require('../models/Message'); // Adjust path to your Message model

const socketService = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

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

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        // Log raw data for debugging
        console.log('Raw data received:', data);
        
        // Ensure data is an object
        let messageData = data;
        if (typeof data === 'string') {
          // If data is a string (e.g., JSON from Postman), parse it
          try {
            messageData = JSON.parse(data);
          } catch (e) {
            throw new Error('Invalid JSON data received');
          }
        }

        console.log('Processed message data:', messageData);

        // Destructure with explicit check
        const { chatId, senderId, content } = messageData || {};
        console.log('chatId:', chatId);
        console.log('senderId:', senderId);
        console.log('content:', content);

        // Validate inputs
        if (!chatId || !senderId || !content) {
          throw new Error('Missing required fields: chatId, senderId, and content are required');
        }

        // Create new message
        const message = await Message.create({
          chat: chatId,
          sender: senderId,
          content,
          read: false
        });

        // Update chat with last message
        await Chat.findByIdAndUpdate(chatId, {
          $push: { messages: message._id },
          lastMessage: message._id
        });

        // Populate sender details for the response
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username');

        // Emit message to all users in the chat room
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
    });
  });
};

module.exports = socketService;