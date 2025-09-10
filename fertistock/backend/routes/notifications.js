const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET: All notifications (can be filtered by read status, type, etc.)
router.get('/', async (req, res) => {
  try {
    const { read, type } = req.query;
    const filter = {};
    if (read !== undefined) {
      filter.read = read === 'true';
    }
    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications.' });
  }
});

// GET: Recent notifications (e.g., last 2 for dashboard)
router.get('/recent', async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(2); // Limit to 2 notifications for the dashboard
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    res.status(500).json({ message: 'Server error while fetching recent notifications.' });
  }
});


// POST: Add a new notification
router.post('/', async (req, res) => {
  try {
    const { message, type, product, details } = req.body;
    if (!message || !type || !product) {
      return res.status(400).json({ message: 'Message, type, and product are required for a notification.' });
    }
    const newNotification = new Notification({ message, type, product, details });
    await newNotification.save();
    res.status(201).json({ message: 'Notification added successfully', notification: newNotification });
  } catch (error) {
    console.error('Error adding notification:', error);
    res.status(500).json({ message: 'Server error while adding notification.' });
  }
});

// PUT: Mark a notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error while marking notification as read.' });
  }
});

// DELETE: Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error while deleting notification.' });
  }
});

module.exports = router;