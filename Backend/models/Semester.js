const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    semesterNumber: {
      type: Number,
      required: true
    },
    sgpa: {
      type: Number,
      required: true
    },
    cgpa: {
      type: Number,
      required: true
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    totalCredits: {
      type: Number,
    },
    totalGrades:{
      type: Number,
    }
  });
  
  module.exports = mongoose.model('Semester', semesterSchema);
  