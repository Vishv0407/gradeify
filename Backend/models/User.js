const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true    
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  semesters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester'
    }
  ],
  visitCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date
  },
  modifiedAt: {
    type: Date
  }
});

module.exports = mongoose.model('User', userSchema);
