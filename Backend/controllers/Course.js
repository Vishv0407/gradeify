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

exports.addSingleCourse = async (req, res) => {
  try {
    const { courseCode, semesterId, credit, cgpa, userId } = req.body;

    // Create a new course instance
    const newCourse = new Course({
      semesterId,
      courseCode,
      credit,
      cgpa,
      userId,
    });

    // Save the new course to the database
    const savedCourse = await newCourse.save();

    // Find the semester by semesterId and push the new course into the courses array
    const updatedSemester = await Semester.findByIdAndUpdate(
      semesterId,
      { $push: { courses: savedCourse._id } }, // Push the new course's ID into the semester's courses array
      { new: true } // Return the updated semester
    );

    if (!updatedSemester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    // Respond with the saved course and updated semester information
    res.status(201).json({ savedCourse, updatedSemester });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Update Course
  // Backend controller function to update course
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params; // Get courseId from URL
    const { courseCode, credit, cgpa } = req.body; // Get course fields from request body

    // Find and update the course in the database
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { courseCode:courseCode , credit: credit, cgpa:cgpa },
      { new: true } // Return the updated course object
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updatedCourse); // Return the updated course in response
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
