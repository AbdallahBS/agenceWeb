const Paiement = require('../models/Paiement');
const Reservation = require('../models/Reservation');
const { consumeSeatForReservation, releaseSeatForReservation } = require('../services/capacityService');

exports.createPaiement = async (req, res, next) => {
  try {
    const paiement = await Paiement.create(req.body);

    await consumeSeatForReservation(paiement.reservation);
    await Reservation.findByIdAndUpdate(paiement.reservation, {
      paiement: paiement._id,
      status: 'payee',
    });

    res.status(201).json(paiement);
  } catch (err) {
    next(err);
  }
};

async function handleKonnectWebhook(payload, res) {
  const paymentRef =
    payload.paymentRef ||
    payload.payment_ref ||
    payload.ref ||
    payload.paymentId ||
    payload.payment_id;
  const statusRaw = String(payload.status || payload.paymentStatus || '').toLowerCase();
  const orderId = payload.orderId || payload.order_id;

  if (!paymentRef && !orderId) {
    return res.status(400).json({ message: 'Webhook invalide: paymentRef/orderId manquant' });
  }

  let paiement = null;
  if (paymentRef) {
    paiement = await Paiement.findOne({ providerPaymentRef: paymentRef });
  }
  if (!paiement && orderId) {
    paiement = await Paiement.findOne({ 'rawResponse.orderId': orderId });
  }
  if (!paiement) {
    return res.status(404).json({ message: 'Paiement non trouvé pour ce webhook' });
  }

  const reservation = await Reservation.findById(paiement.reservation);
  if (!reservation) {
    return res.status(404).json({ message: 'Réservation non trouvée pour ce paiement' });
  }

  const isPaid = ['paid', 'success', 'succeeded', 'completed'].includes(statusRaw);
  const isCancelled = ['cancelled', 'canceled', 'failed', 'expired'].includes(statusRaw);

  if (isPaid) {
    await consumeSeatForReservation(reservation._id);
    paiement.status = 'succeeded';
    paiement.datePaiement = new Date();
    reservation.status = 'payee';
    reservation.paymentUrl = undefined;
    reservation.paymentExpiresAt = undefined;
  } else if (isCancelled) {
    paiement.status = statusRaw === 'expired' ? 'expired' : 'cancelled';
    await releaseSeatForReservation(reservation._id);
    if (reservation.status !== 'payee') {
      reservation.status = 'annulee';
    }
  }

  paiement.rawResponse = { ...(paiement.rawResponse || {}), webhook: payload };
  await paiement.save();
  await reservation.save();

  return res.json({ message: 'Webhook traité avec succès' });
}

exports.konnectWebhook = async (req, res, next) => {
  try {
    return handleKonnectWebhook(req.body || {}, res);
  } catch (err) {
    next(err);
  }
};

exports.konnectWebhookGet = async (req, res, next) => {
  try {
    return handleKonnectWebhook(req.query || {}, res);
  } catch (err) {
    next(err);
  }
};

exports.getPaiements = async (req, res, next) => {
  try {
    const paiements = await Paiement.find().populate('reservation');
    res.json(paiements);
  } catch (err) {
    next(err);
  }
};

exports.getPaiementById = async (req, res, next) => {
  try {
    const paiement = await Paiement.findById(req.params.id).populate(
      'reservation'
    );
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.json(paiement);
  } catch (err) {
    next(err);
  }
};

exports.updatePaiement = async (req, res, next) => {
  try {
    const paiement = await Paiement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.json(paiement);
  } catch (err) {
    next(err);
  }
};

exports.deletePaiement = async (req, res, next) => {
  try {
    const paiement = await Paiement.findByIdAndDelete(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.json({ message: 'Paiement supprimé avec succès' });
  } catch (err) {
    next(err);
  }
};
