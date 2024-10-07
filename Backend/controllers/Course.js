const Course = require('../models/Course');
const Semester = require('../models/Semester');

// Add Course
exports.addCourses = async (req, res) => {
  try {
    const { courses, semesterId, userId } = req.body;

    // Extract course details and prepare the array for insertion
    const courseData = courses.map(course => ({
      courseCode: course.courseCode,
      credit: course.credit,
      cgpa: course.cgpa,
      semesterId,
      userId
    }));

    // Save all courses in one go
    const savedCourses = await Course.insertMany(courseData);

    res.status(201).json(savedCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Course
exports.updateCourse = async (req, res) => {
  try {
    const { courseId, name, credit, grade } = req.body; // courseId from URL parameters

    const updatedCourse = await Course.findByIdAndUpdate(courseId, {name, credit, grade}, { new: true });

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params; // courseId from URL parameters

    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Remove course reference from the semester's courses array
    await Semester.findByIdAndUpdate(deletedCourse.semester, {
      $pull: { courses: courseId }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
