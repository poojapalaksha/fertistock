// models/Fertilizer.js (Example)
const mongoose = require('mongoose');

const fertilizerSchema = new mongoose.Schema({
  fertilizerName: { type: String, required: true },
  quantityReceived: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now }, // <--- Make sure this is 'Date' type
  invoiceNumber: { type: String, required: true, unique: true },
  expiryDate: { type: Date, required: true },
  price: { type: Number, required: true },
}, { timestamps: true }); // timestamps adds createdAt and updatedAt in UTC

module.exports = mongoose.model('Fertilizer', fertilizerSchema);