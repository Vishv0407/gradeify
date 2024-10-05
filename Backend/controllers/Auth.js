const User = require('../models/User'); // Your User model

exports.addUser = async (req, res) => {
    try {
      const { name, email, googleId } = req.body;
  
      let user = await User.findOne({ email });
  
      const currentISTTime = new Date();
      currentISTTime.setMinutes(currentISTTime.getMinutes() + 330); // Convert UTC to IST
  
      if (!user) {
        // Create a new user if they don't exist
        user = new User({
          name,
          email,
          googleId,
          createdAt: currentISTTime, // Set createdAt to IST for new user
          modifiedAt: currentISTTime  // Also set modifiedAt for new user
        });
      } else {
        // Update modifiedAt if user exists
        user.modifiedAt = currentISTTime;
      }
  
      // Increment the visit count
      user.visitCount += 1;
  
      await user.save();
  
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
