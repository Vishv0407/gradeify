const express = require('express');
const router = express.Router();
const courseController = require('../controllers/Course');

// Routes for Course
router.post('/addCourse', courseController.addCourse); // Add Course
router.put('/updateCourse', courseController.updateCourse); // Update Course
router.delete('/deleteCourse/:courseId', courseController.deleteCourse); // Delete Course

module.exports = router;
