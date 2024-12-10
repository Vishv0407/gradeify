const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users with their semesters and courses populated
        const users = await User.find()
            .populate({
                path: 'semesters',
                populate: {
                    path: 'courses',
                    model: 'Course'
                }
            });

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
};
