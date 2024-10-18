const Semester = require('../models/Semester');
const User = require('../models/User');
const Course = require('../models/Course');

// Add Semester
exports.addSemesterWithCourses = async (req, res) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const { userId, semesterNumber, sgpa, courses, totalCredits, totalGrades } = req.body;

    // // Create and save the courses in one go
    // const savedCourses = await Course.insertMany(courses.map(course => ({ ...course, userId })));

    // Get the course ids to link them with the semester

    // Create a new semester
    const newSemester = new Semester({
      userId,
      semesterNumber,
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

exports.updateSemester = async (req, res) => {
  try {
      const { semesterId, totalCredits, sgpa, totalGrades, courses } = req.body;

      // Find the semester by its ID and update its details
      const updatedSemester = await Semester.findByIdAndUpdate(
          semesterId,
          {
              sgpa,
              totalCredits,
              totalGrades,
              courses, // Assuming courses is an array of course ObjectIds
          },
          { new: true } // Return the updated semester after modification
      );

      if (!updatedSemester) {
          return res.status(404).json({ message: 'Semester not found' });
      }

      return res.status(200).json(updatedSemester);
  } catch (error) {
      console.error('Error updating semester:', error);
      return res.status(500).json({ message: 'Failed to update semester' });
  }
};

// Delete Semester
exports.deleteSemester = async (req, res) => {
  try {
    // const { semesterId } = req.params;
    const { userId, semesterId } = req.body;

    // Find the semester to retrieve the course IDs
    const semesterToDelete = await Semester.findById(semesterId).populate('courses');

    if (!semesterToDelete) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    // Delete all courses associated with the semester
    await Course.deleteMany({ _id: { $in: semesterToDelete.courses } });

    // Remove semester reference from user's semesters array
    const userUpdateResult = await User.findByIdAndUpdate(userId, {
      $pull: { semesters: semesterId }
    });

    // Check if the user was found and updated
    if (!userUpdateResult) {
      console.error('User not found or update failed');
      return res.status(404).json({ message: 'User not found' });
    }

    // Now delete the semester
    await Semester.findByIdAndDelete(semesterId);

    res.status(204).json(); // No content response for successful delete
  } catch (error) {
    console.error('Error deleting semester:', error);
    res.status(500).json({ message: error.message });
  }
};



