const Paiement = require('../models/Paiement');
const Reservation = require('../models/Reservation');
const { initKonnectPayment } = require('../utils/konnect');

const PAYMENT_LIFESPAN_MINUTES = Number(process.env.KONNECT_LIFESPAN_MINUTES) || 10;

async function createKonnectPaymentForReservation(reservationDoc) {
  const reservation = await Reservation.findById(reservationDoc._id)
    .populate('client')
    .populate('voyage')
    .populate('paiement');

  if (!reservation) throw new Error('Reservation non trouvée');
  if (reservation.status === 'annulee') {
    throw new Error("Paiement impossible pour une reservation annulée");
  }
  if (reservation.paiement && reservation.paiement.status === 'succeeded') {
    return {
      paiement: reservation.paiement,
      paymentUrl: reservation.paiement.paymentUrl || reservation.paymentUrl,
      paymentExpiresAt: reservation.paiement.expiresAt || reservation.paymentExpiresAt,
    };
  }

  const orderId = `res_${String(reservation._id).slice(-6)}_${String(Date.now()).slice(-6)}`;
  const description = `Paiement reservation ${reservation._id} - ${reservation.voyage?.titre || ''}`.trim();
  const konnect = await initKonnectPayment({
    amount: reservation.montantTotal,
    description,
    firstName: reservation.client?.prenom || 'Client',
    lastName: reservation.client?.nom || 'Agence',
    phoneNumber: reservation.client?.telephone || '',
    email: reservation.client?.email,
    orderId,
    lifespanMinutes: PAYMENT_LIFESPAN_MINUTES,
  });

  const expiresAt = new Date(Date.now() + PAYMENT_LIFESPAN_MINUTES * 60 * 1000);
  const payload = {
    montant: reservation.montantTotal,
    methode: 'carte',
    reservation: reservation._id,
    provider: 'konnect',
    providerPaymentRef: konnect.paymentRef,
    paymentUrl: konnect.payUrl,
    expiresAt,
    status: 'pending',
    rawResponse: konnect.raw,
  };

  let paiement = await Paiement.findOne({ reservation: reservation._id });
  if (paiement) {
    Object.assign(paiement, payload);
    await paiement.save();
  } else {
    paiement = await Paiement.create(payload);
  }

  await Reservation.findByIdAndUpdate(reservation._id, {
    paiement: paiement._id,
    paymentUrl: konnect.payUrl,
    paymentReference: konnect.paymentRef,
    paymentExpiresAt: expiresAt,
  });

  return {
    paiement,
    paymentUrl: konnect.payUrl,
    paymentExpiresAt: expiresAt,
    paymentReference: konnect.paymentRef,
  };
}

module.exports = { createKonnectPaymentForReservation, PAYMENT_LIFESPAN_MINUTES };
