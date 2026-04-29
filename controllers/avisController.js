const Avis = require('../models/Avis');
const Voyage = require('../models/Voyage');
const Reservation = require('../models/Reservation');

exports.createAvis = async (req, res, next) => {
  try {
    const voyage = await Voyage.findById(req.body.voyage);
    if (!voyage) {
      return res.status(400).json({ message: 'Voyage invalide ou introuvable' });
    }

    const existingAvis = await Avis.findOne({
      client: req.user._id,
      voyage: req.body.voyage,
    });
    if (existingAvis) {
      return res.status(400).json({
        message: 'Vous avez deja ajoute un avis pour ce voyage',
      });
    }

    const hasReservation = await Reservation.exists({
      client: req.user._id,
      voyage: req.body.voyage,
      status: { $in: ['confirmee', 'payee'] },
    });
    if (!hasReservation) {
      return res.status(403).json({
        message: "Vous devez avoir une reservation confirmee/paye pour laisser un avis",
      });
    }

    const avis = await Avis.create({
      commentaire: req.body.commentaire,
      note: req.body.note,
      voyage: req.body.voyage,
      client: req.user._id,
    });

    const populatedAvis = await Avis.findById(avis._id).populate('client').populate('voyage');
    res.status(201).json(populatedAvis);
  } catch (err) {
    next(err);
  }
};

exports.getAvis = async (req, res, next) => {
  try {
    const avis = await Avis.find().populate('client').populate('voyage');
    res.json(avis);
  } catch (err) {
    next(err);
  }
};

exports.getAvisById = async (req, res, next) => {
  try {
    const avis = await Avis.findById(req.params.id)
      .populate('client')
      .populate('voyage');
    if (!avis) return res.status(404).json({ message: 'Avis non trouvé' });
    res.json(avis);
  } catch (err) {
    next(err);
  }
};

exports.updateAvis = async (req, res, next) => {
  try {
    const avis = await Avis.findById(req.params.id);
    if (!avis) return res.status(404).json({ message: 'Avis non trouvé' });

    const isOwner = String(avis.client) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit à cet avis' });
    }

    if (req.body.voyage) {
      const voyageExists = await Voyage.findById(req.body.voyage);
      if (!voyageExists) {
        return res.status(400).json({ message: 'Voyage invalide ou introuvable' });
      }
      avis.voyage = req.body.voyage;
    }
    if (req.body.commentaire !== undefined) avis.commentaire = req.body.commentaire;
    if (req.body.note !== undefined) avis.note = req.body.note;

    await avis.save();
    const populatedAvis = await Avis.findById(avis._id).populate('client').populate('voyage');
    res.json(populatedAvis);
  } catch (err) {
    next(err);
  }
};

exports.deleteAvis = async (req, res, next) => {
  try {
    const avis = await Avis.findById(req.params.id);
    if (!avis) return res.status(404).json({ message: 'Avis non trouvé' });

    const isOwner = String(avis.client) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit à cet avis' });
    }

    await avis.deleteOne();
    res.json({ message: 'Avis supprimé avec succès' });
  } catch (err) {
    next(err);
  }
};
