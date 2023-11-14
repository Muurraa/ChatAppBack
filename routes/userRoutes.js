const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/all-users', userController.getAllUsers);
router.get('/user-profile', userController.getUserProfile);
router.put('/update-user-picture', userController.updateUserPicture);
router.put('/update-password', userController.updatePassword);

module.exports = router;