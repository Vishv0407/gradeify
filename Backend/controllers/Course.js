const Course = require('../models/Course');
const Semester = require('../models/Semester');

// Add Course
exports.addCourse = async (req, res) => {
  try {
    const { name, credit, grade, semesterId } = req.body;
    // const {  } = req.params; // semesterId from URL parameters

    const newCourse = new Course({
      name,
      credit,
      grade,
      semester: semesterId
    });

    await newCourse.save();

    // Push course reference to the semester's courses array
    await Semester.findByIdAndUpdate(semesterId, {
      $push: { courses: newCourse._id }
    });

    res.status(201).json(newCourse);
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
