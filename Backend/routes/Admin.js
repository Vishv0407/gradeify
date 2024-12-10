const express = require('express');
const router = express.Router();
const adminController = require('../controllers/Admin');

// User routes
router.get('/users', adminController.getAllUsers);

module.exports = router;
