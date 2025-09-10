const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Add new user
router.post('/add-user', async (req, res) => {
  const { userId, password, role } = req.body;

  if (!userId || !password || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const existing = await User.findOne({ userId: userId.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({
      userId: userId.toLowerCase(),
      password,
      role: role.toLowerCase(),
    });

    await newUser.save();
    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/delete-user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const deleted = await User.findOneAndDelete({
      userId: { $regex: new RegExp(`^${userId}$`, 'i') } // case-insensitive match
    });

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
