const Semester = require('../models/Semester');
const User = require('../models/User');

// Add Semester
exports.addSemester = async (req, res) => {
  try {
    const { number, sgpa, cgpa , userId} = req.body;
    // const userId = req.body; // assuming user info is available in req.user after authentication

    const newSemester = new Semester({
      number,
      sgpa,
      cgpa,
      user: userId
    });

    await newSemester.save();

    // Push semester reference to user's semesters array
    await User.findByIdAndUpdate(userId, {
      $push: { semesters: newSemester._id }
    });

    res.status(201).json(newSemester);
  } catch (error) {
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
