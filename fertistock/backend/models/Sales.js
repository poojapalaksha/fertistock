const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customerName: String,
  mobileNumber: String,
  items: [
    {
      fertilizerName: String,
      quantity: Number,
      pricePerUnit: Number,
    },
  ],
  totalAmount: Number,
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
