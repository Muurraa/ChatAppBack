const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/create-post', postController.createPosts);
router.get('/get-posts', postController.getPosts);
router.put('/update-posts-likes', postController.updateLikes);
router.post('/create-comment', postController.createComment);


module.exports = router;