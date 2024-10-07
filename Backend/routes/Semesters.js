const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/Semester');

// Routes for Semester
router.post('/addSemester', semesterController.addSemesterWithCourses); // Add Semester
router.put('/updateSemester/:semesterId', semesterController.updateSemester); // Update Semester
router.delete('/deleteSemester/:semesterId', semesterController.deleteSemester); // Delete Semester

module.exports = router;
