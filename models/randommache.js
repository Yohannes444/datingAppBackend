const mongoose = require('mongoose');

const randomMatchSchema = new mongoose.Schema({
  member1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  member2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user1WentToChatStatus: {
    type: String,
    enum: ['unanswered', 'accepted', 'rejected'],
    default: 'unanswered'
  },
  user2WentToChatStatus: {
    type: String,
    enum: ['unanswered', 'accepted', 'rejected'],
    default: 'unanswered'
  }
}, {
  timestamps: true
});

randomMatchSchema.index({ member1: 1, member2: 1 });

module.exports = mongoose.model('RandomMatch', randomMatchSchema);