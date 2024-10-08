const express = require('express');
const router = express.Router();
const courseController = require('../controllers/Course');

// Routes for Course
router.post('/addCourses', courseController.addCourses); // Add Courses
router.post('/addSingleCourse', courseController.addSingleCourse); // Add Course
router.put('/updateCourse/:courseId', courseController.updateCourse); // Update Course
router.delete('/deleteCourse/:courseId', courseController.deleteCourse); // Delete Course

module.exports = router;
