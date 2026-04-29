const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    adresse: { type: String, required: true, trim: true },
    ville: { type: String, required: true, trim: true },
    pays: { type: String, required: true, trim: true },
    etoiles: { type: Number, min: 1, max: 5, default: 3 },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hotel', hotelSchema);
