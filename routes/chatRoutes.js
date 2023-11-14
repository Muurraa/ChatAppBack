const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/send-message', chatController.sendMessage);
router.get('/chat-history', chatController.getChatHistory);
router.get('/user-conversations', chatController.getUserConversations);

module.exports = router;