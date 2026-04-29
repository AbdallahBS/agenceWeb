const Reservation = require('../models/Reservation');
const Paiement = require('../models/Paiement');

const JOB_INTERVAL_MS = 60 * 1000;

async function cancelExpiredReservations() {
  const now = new Date();
  const expiredReservations = await Reservation.find({
    status: 'confirmee',
    paymentExpiresAt: { $lte: now },
  }).select('_id');

  if (!expiredReservations.length) return;

  const ids = expiredReservations.map((r) => r._id);
  await Reservation.updateMany(
    { _id: { $in: ids }, status: { $ne: 'payee' } },
    {
      $set: { status: 'annulee' },
      $unset: { paymentUrl: 1, paymentExpiresAt: 1 },
    }
  );

  await Paiement.updateMany(
    { reservation: { $in: ids }, status: 'pending', expiresAt: { $lte: now } },
    { $set: { status: 'expired' } }
  );
}

function startReservationExpiryJob() {
  setInterval(() => {
    cancelExpiredReservations().catch((err) => {
      console.error('[reservation-expiry-job] erreur:', err.message);
    });
  }, JOB_INTERVAL_MS);
}

module.exports = { startReservationExpiryJob, cancelExpiredReservations };
