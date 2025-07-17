const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: String,
  products: [{
    productId: String,
    quantity: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);