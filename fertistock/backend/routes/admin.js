const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/fertistock', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// GET all users (without password)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST Add new user with hashed password
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId: userId.toLowerCase(),
      password: hashedPassword,
      role: role.toLowerCase(),
    });

    await newUser.save();
    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a user
router.delete('/delete-user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const deleted = await User.findOneAndDelete({ userId: userId.toLowerCase() });
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST Login Route with bcrypt password check
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const user = await User.findOne({
      userId: username.toLowerCase(),
      role: role.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Login successful',
      userId: user.userId,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
