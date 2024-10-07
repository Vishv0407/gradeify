const Semester = require('../models/Semester');
const User = require('../models/User');
const Course = require('../models/Course');

// Add Semester
exports.addSemesterWithCourses = async (req, res) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const { userId, semesterNumber, cgpa, sgpa, courses, totalCredits, totalGrades } = req.body;

    // // Create and save the courses in one go
    // const savedCourses = await Course.insertMany(courses.map(course => ({ ...course, userId })));

    // Get the course ids to link them with the semester
    // const courseIds = courses.map(course => course._id);
    console.log(courses);

    // Create a new semester
    const newSemester = new Semester({
      userId,
      semesterNumber,
      cgpa,
      sgpa,
      courses,
      totalCredits,
      totalGrades
    });

    // Save the semester
    const savedSemester = await newSemester.save();

    // Update the user's semester array
    await User.findByIdAndUpdate(userId, {
      $push: { semesters: savedSemester._id },
    });

    // await session.commitTransaction();
    // session.endSession();

    res.status(201).json(savedSemester);
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Update Semester
exports.updateSemester = async (req, res) => {
  try {
    const {sgpa, cgpa, semesterId} = req.body;

    const updatedSemester = await Semester.findByIdAndUpdate(semesterId, {
        sgpa,
        cgpa
    }, { new: true });

    if (!updatedSemester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    res.json(updatedSemester);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Semester
exports.deleteSemester = async (req, res) => {
  try {
    const { semesterId } = req.params;

    const deletedSemester = await Semester.findByIdAndDelete(semesterId);

    if (!deletedSemester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    // Remove semester reference from user's semesters array
    await User.findByIdAndUpdate(deletedSemester.user, {
      $pull: { semesters: semesterId }
    });

    res.json({ message: 'Semester deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
