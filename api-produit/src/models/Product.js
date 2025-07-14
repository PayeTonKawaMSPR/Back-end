const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true, trim: true},
  prix: { type: Number, required: true, min: 0},
  description: {type: String, required: true},
  //enStock: { type: Boolean, default: true },
  Stock: { type: Number, required: true, default: 0, min: 0},
  imagePath: { type: String, default: null }
});

productSchema.index({ nom: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
