module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);
  
      // Join a chat room
      socket.on('joinChat', ({ chatId }) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
      });
  
      // Handle sending a message
      socket.on('sendMessage', async ({ chatId, senderId, content }) => {
        // Save message to DB
        const Message = require('../models/Message');
        const Chat = require('../models/Chat');
        const message = await Message.create({ chat: chatId, sender: senderId, content });
        
        // Update chat's last message
        await Chat.findByIdAndUpdate(chatId, { $push: { messages: message._id }, lastMessage: message._id });
  
        // Broadcast message to the chat room
        io.to(chatId).emit('newMessage', { message });
      });
  
      // Disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  };
  