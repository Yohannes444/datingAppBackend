const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }, // Message text
  read: { type: Boolean, default: false },  // Read status
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
