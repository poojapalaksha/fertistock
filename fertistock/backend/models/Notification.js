const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['lowStock', 'expiring', 'stockAdded'], // Added 'stockAdded' for new stock entries
    required: true,
  },
  product: { // To link notifications to specific products
    type: String,
    required: true,
  },
  details: { // More specific info about the notification
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true }); // `timestamps: true` automatically adds `createdAt` and `updatedAt`

module.exports = mongoose.model('Notification', notificationSchema);