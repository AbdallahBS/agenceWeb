const Hotel = require('../models/Hotel');

exports.createHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) {
    next(err);
  }
};

exports.getHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    next(err);
  }
};

exports.getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel non trouve' });
    res.json(hotel);
  } catch (err) {
    next(err);
  }
};

exports.updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hotel) return res.status(404).json({ message: 'Hotel non trouve' });
    res.json(hotel);
  } catch (err) {
    next(err);
  }
};

exports.deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel non trouve' });
    res.json({ message: 'Hotel supprime avec succes' });
  } catch (err) {
    next(err);
  }
};
