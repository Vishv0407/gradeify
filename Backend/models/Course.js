const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: {
      type: String,
      required: true
    },
    credit: {
      type: Number,
      required: true
    },
    cgpa: {
      type: Number,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    semesterId: {
      type: Number,
    }
  });
  
  module.exports = mongoose.model('Course', courseSchema);
  