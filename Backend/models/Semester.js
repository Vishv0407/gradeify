const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    number: {
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  });
  
  module.exports = mongoose.model('Semester', semesterSchema);
  