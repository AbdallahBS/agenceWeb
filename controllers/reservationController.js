const Reservation = require('../models/Reservation');
const Voyage = require('../models/Voyage');
const Paiement = require('../models/Paiement');
const { sendEmail } = require('../utils/mailer');
const { reservationStatusEmail } = require('../utils/emailTemplates');
const { createKonnectPaymentForReservation } = require('../services/paymentService');
const { releaseSeatForReservation } = require('../services/capacityService');

function getRemainingSeats(voyage) {
  const fromDisponible = Number(voyage?.capaciteDisponible);
  if (Number.isFinite(fromDisponible)) return fromDisponible;
  const fromCapacite = Number(voyage?.capacite);
  return Number.isFinite(fromCapacite) ? fromCapacite : 0;
}

exports.createReservation = async (req, res, next) => {
  try {
    const voyage = await Voyage.findById(req.body.voyage);
    if (!voyage) {
      return res.status(400).json({ message: 'Voyage invalide ou introuvable' });
    }
    if (getRemainingSeats(voyage) <= 0) {
      return res.status(400).json({ message: 'Ce voyage est complet' });
    }

    const reservation = await Reservation.create({
      voyage: req.body.voyage,
      client: req.user._id,
      montantTotal: voyage.prix,
      status: 'en_attente',
    });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('client')
      .populate('voyage')
      .populate('paiement');

    res.status(201).json(populatedReservation);
  } catch (err) {
    next(err);
  }
};

exports.getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ client: req.user._id })
      .populate('voyage')
      .populate('paiement');
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

exports.getReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate('client')
      .populate('voyage')
      .populate('paiement');
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

exports.getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('client')
      .populate('voyage')
      .populate('paiement');
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    const isOwner = String(reservation.client?._id || reservation.client) === String(req.user._id);
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'Accès interdit à cette réservation' });
    }

    res.json(reservation);
  } catch (err) {
    next(err);
  }
};

exports.updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['confirmee', 'annulee'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status invalide. Valeurs autorisées: 'confirmee' ou 'annulee'",
      });
    }

    const reservation = await Reservation.findById(req.params.id).populate('client').populate('voyage');
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    let paymentUrl;
    let paymentExpiresAt;
    if (status === 'confirmee') {
      const voyage = await Voyage.findById(reservation.voyage);
      if (!voyage || getRemainingSeats(voyage) <= 0) {
        return res.status(400).json({ message: 'Ce voyage est complet' });
      }

      const paymentInfo = await createKonnectPaymentForReservation(reservation);
      paymentUrl = paymentInfo.paymentUrl;
      paymentExpiresAt = paymentInfo.paymentExpiresAt;
      reservation.paymentReference = paymentInfo.paymentReference;
      reservation.paymentUrl = paymentInfo.paymentUrl;
      reservation.paymentExpiresAt = paymentInfo.paymentExpiresAt;
    } else if (status === 'annulee') {
      await releaseSeatForReservation(reservation._id);
      reservation.paymentUrl = undefined;
      reservation.paymentReference = undefined;
      reservation.paymentExpiresAt = undefined;
      if (reservation.paiement) {
        await Paiement.findByIdAndUpdate(reservation.paiement, { status: 'cancelled' });
      }
    }
    reservation.status = status;
    await reservation.save();

    const emailPayload = reservationStatusEmail({
      prenom: reservation.client?.prenom,
      nom: reservation.client?.nom,
      voyageTitre: reservation.voyage?.titre,
      status: reservation.status,
      montantTotal: reservation.montantTotal,
      paymentUrl,
      paymentExpiresAt,
    });

    if (reservation.client?.email) {
      sendEmail({
        to: reservation.client.email,
        subject: emailPayload.subject,
        text: emailPayload.text,
        html: emailPayload.html,
      }).catch((emailErr) =>
        console.error('[reservation] échec envoi email statut :', emailErr.message)
      );
    }

    const populatedReservation = await Reservation.findById(req.params.id)
      .populate('client')
      .populate('voyage')
      .populate('paiement');

    res.json(populatedReservation);
  } catch (err) {
    next(err);
  }
};

exports.deleteReservation = async (req, res, next) => {
  try {
    await releaseSeatForReservation(req.params.id);
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    res.json({ message: 'Réservation supprimée avec succès' });
  } catch (err) {
    next(err);
  }
};
