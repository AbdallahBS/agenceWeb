const Voyage = require('../models/Voyage');
const Vol = require('../models/Vol');

exports.createVoyage = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.capacite !== undefined && payload.capaciteDisponible === undefined) {
      payload.capaciteDisponible = payload.capacite;
    }
    const voyage = await Voyage.create(payload);
    res.status(201).json(voyage);
  } catch (err) {
    next(err);
  }
};

exports.getVoyages = async (req, res, next) => {
  try {
    const voyages = await Voyage.find();
    res.json(voyages);
  } catch (err) {
    next(err);
  }
};

exports.getVoyageById = async (req, res, next) => {
  try {
    const voyage = await Voyage.findById(req.params.id);
    if (!voyage) return res.status(404).json({ message: 'Voyage non trouvé' });
    res.json(voyage);
  } catch (err) {
    next(err);
  }
};

exports.updateVoyage = async (req, res, next) => {
  try {
    const voyage = await Voyage.findById(req.params.id);
    if (!voyage) return res.status(404).json({ message: 'Voyage non trouvé' });

    const soldSeats = voyage.capacite - voyage.capaciteDisponible;
    if (req.body.capacite !== undefined) {
      if (req.body.capacite < soldSeats) {
        return res.status(400).json({
          message: `Impossible de réduire capacite en dessous des places deja vendues (${soldSeats})`,
        });
      }
      voyage.capacite = req.body.capacite;
      if (req.body.capaciteDisponible === undefined) {
        voyage.capaciteDisponible = req.body.capacite - soldSeats;
      }
    }

    if (req.body.capaciteDisponible !== undefined) {
      voyage.capaciteDisponible = req.body.capaciteDisponible;
    }
    if (req.body.titre !== undefined) voyage.titre = req.body.titre;
    if (req.body.prix !== undefined) voyage.prix = req.body.prix;
    if (req.body.dateDepart !== undefined) voyage.dateDepart = req.body.dateDepart;
    if (req.body.dateRetour !== undefined) voyage.dateRetour = req.body.dateRetour;

    await voyage.save();
    res.json(voyage);
  } catch (err) {
    next(err);
  }
};

exports.deleteVoyage = async (req, res, next) => {
  try {
    const voyage = await Voyage.findByIdAndDelete(req.params.id);
    if (!voyage) return res.status(404).json({ message: 'Voyage non trouvé' });

    const deletedVols = await Vol.deleteMany({ voyage: req.params.id });
    res.json({
      message: 'Voyage supprimé avec succès',
      volsSupprimes: deletedVols.deletedCount,
    });
  } catch (err) {
    next(err);
  }
};
