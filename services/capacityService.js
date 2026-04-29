const Reservation = require('../models/Reservation');
const Voyage = require('../models/Voyage');

async function consumeSeatForReservation(reservationId) {
  const reservation = await Reservation.findOneAndUpdate(
    { _id: reservationId, capacityCounted: false },
    { $set: { capacityCounted: true } },
    { new: true }
  );

  if (!reservation) return { alreadyCounted: true };

  const voyage = await Voyage.findOneAndUpdate(
    { _id: reservation.voyage, capaciteDisponible: { $gt: 0 } },
    { $inc: { capaciteDisponible: -1 } },
    { new: true }
  );

  if (!voyage) {
    await Reservation.findByIdAndUpdate(reservationId, { capacityCounted: false });
    throw new Error('Plus de places disponibles pour ce voyage');
  }

  return { alreadyCounted: false, capaciteDisponible: voyage.capaciteDisponible };
}

async function releaseSeatForReservation(reservationId) {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation || !reservation.capacityCounted) {
    return { released: false };
  }

  await Voyage.findByIdAndUpdate(reservation.voyage, { $inc: { capaciteDisponible: 1 } });
  reservation.capacityCounted = false;
  await reservation.save();
  return { released: true };
}

module.exports = { consumeSeatForReservation, releaseSeatForReservation };
