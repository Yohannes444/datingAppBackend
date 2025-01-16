const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], // Reference to messages
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }, // For quick access
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
