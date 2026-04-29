const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    dateReservation: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['en_attente', 'confirmee', 'annulee', 'payee'],
      default: 'en_attente',
    },
    montantTotal: { type: Number, required: true, min: 0 },
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
    paiement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paiement',
    },
    paymentUrl: { type: String, trim: true },
    paymentReference: { type: String, trim: true },
    paymentExpiresAt: { type: Date },
    capacityCounted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
