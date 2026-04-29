const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelController');

router.use(protect, authorize('admin', 'gestionnaire'));

router.post('/', createHotel);
router.get('/', getHotels);
router.get('/:id', getHotelById);
router.put('/:id', updateHotel);
router.delete('/:id', deleteHotel);

module.exports = router;
