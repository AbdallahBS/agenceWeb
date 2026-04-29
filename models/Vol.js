const mongoose = require('mongoose');

const volSchema = new mongoose.Schema(
  {
    arrivee: { type: String, required: true, trim: true },
    depart: { type: String, required: true, trim: true },
    dateDepart: { type: Date, required: true },
    dateArrivee: { type: Date, required: true },
    description: {
      type: Map,
      of: String,
      default: {},
    },
    voyage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voyage',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vol', volSchema);
