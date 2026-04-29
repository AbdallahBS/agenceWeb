const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema(
  {
    commentaire: { type: String, required: true, trim: true },
    note: { type: Number, required: true, min: 1, max: 5 },
    dateAvis: { type: Date, default: Date.now },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    voyage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voyage',
      required: true,
    },
  },
  { timestamps: true }
);

avisSchema.index({ client: 1, voyage: 1 }, { unique: true });

module.exports = mongoose.model('Avis', avisSchema);
