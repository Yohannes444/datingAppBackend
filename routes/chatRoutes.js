const express = require('express');
const chatController = require('../controllers/chatController');
const router = express.Router();
const helper = require("../middleware/Helpers/auth");

router.post('/createChat', chatController.createChat);
router.get('/getMessages/:chatId', chatController.getMessages);
router.get('/between/:user1Id/:user2Id', chatController.getChatBetweenUsers);

module.exports = router;
