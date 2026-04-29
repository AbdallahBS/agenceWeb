const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema(
  {
    montant: { type: Number, required: true, min: 0 },
    datePaiement: { type: Date, default: Date.now },
    methode: {
      type: String,
      enum: ['carte', 'especes', 'virement', 'paypal'],
      required: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    provider: {
      type: String,
      enum: ['konnect'],
      default: 'konnect',
    },
    providerPaymentRef: { type: String, trim: true },
    paymentUrl: { type: String, trim: true },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'expired', 'cancelled'],
      default: 'pending',
    },
    rawResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

paiementSchema.index({ reservation: 1 }, { unique: true });

module.exports = mongoose.model('Paiement', paiementSchema);
