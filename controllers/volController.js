const Vol = require('../models/Vol');
const Voyage = require('../models/Voyage');
const Hotel = require('../models/Hotel');

exports.createVol = async (req, res, next) => {
  try {
    const voyageExists = await Voyage.findById(req.body.voyage);
    if (!voyageExists) {
      return res.status(400).json({ message: 'Voyage invalide ou introuvable' });
    }
    const hotelExists = await Hotel.findById(req.body.hotel);
    if (!hotelExists) {
      return res.status(400).json({ message: 'Hotel invalide ou introuvable' });
    }

    const vol = await Vol.create(req.body);
    const populatedVol = await vol.populate(['voyage', 'hotel']);
    res.status(201).json(populatedVol);
  } catch (err) {
    next(err);
  }
};

exports.getVols = async (req, res, next) => {
  try {
    const vols = await Vol.find().populate(['voyage', 'hotel']);
    res.json(vols);
  } catch (err) {
    next(err);
  }
};

exports.getVolById = async (req, res, next) => {
  try {
    const vol = await Vol.findById(req.params.id).populate(['voyage', 'hotel']);
    if (!vol) return res.status(404).json({ message: 'Vol non trouve' });
    res.json(vol);
  } catch (err) {
    next(err);
  }
};

exports.updateVol = async (req, res, next) => {
  try {
    if (req.body.voyage) {
      const voyageExists = await Voyage.findById(req.body.voyage);
      if (!voyageExists) {
        return res.status(400).json({ message: 'Voyage invalide ou introuvable' });
      }
    }
    if (req.body.hotel) {
      const hotelExists = await Hotel.findById(req.body.hotel);
      if (!hotelExists) {
        return res.status(400).json({ message: 'Hotel invalide ou introuvable' });
      }
    }

    const vol = await Vol.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(['voyage', 'hotel']);
    if (!vol) return res.status(404).json({ message: 'Vol non trouve' });
    res.json(vol);
  } catch (err) {
    next(err);
  }
};

exports.deleteVol = async (req, res, next) => {
  try {
    const vol = await Vol.findByIdAndDelete(req.params.id);
    if (!vol) return res.status(404).json({ message: 'Vol non trouve' });
    res.json({ message: 'Vol supprime avec succes' });
  } catch (err) {
    next(err);
  }
};
