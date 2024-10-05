const express = require('express');
const router = express.Router();
const userController = require('../controllers/Auth');

// User routes
// router.post('/logout', userController.logoutUser); // Logout User
router.post('/user', userController.addUser);

module.exports = router;
